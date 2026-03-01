import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, Subject, throwError } from 'rxjs';
import { agent } from '../models/agent';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _url: string;
  private _errorsSubject: Subject<any> = new Subject<any>();
  private headers: HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json",
    "Accept": "application/json"
  });

  constructor(
    private _http: HttpClient,
  ) {
    this._url = `${window.location.protocol}//${document.location.host}`;
  }

  public get errorsSubject() : Subject<any> {
    return this._errorsSubject;
  }

  private handleError(error: any) {
    this.errorsSubject.next(error.error);
    return throwError(() => error.error);
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this._http.get(`${this._url}${path}`, { headers: this.headers, params })
      .pipe(catchError(error => this.handleError(error)));
  }

  public getAgentPresence(): Observable<agent[]> {
    return this.get('/api/rpc/agents')
      .pipe(
        map((res: any) => {
          const now = Date.now();
          let agents: any[] = [];

          if (Array.isArray(res)) {
            agents = res;
          } else if (Array.isArray(res?.result)) {
            agents = res.result;
          } else if (Array.isArray(res?.rows)) {
            agents = res.rows;
          } else if (Array.isArray(res?.data)) {
            agents = res.data;
          } else if (res && typeof res === 'object') {
            agents = [res];
          }

          const rows: agent[] = agents
            .map((a: any) => {
              const since = a.voiceStatusTime || a.stateTime || now;
              const diff = Math.max(0, now - since);

              let status = 'Online';

              if (a.online === false) {
                status = 'Offline';
              } else if (
                a.voicePause ||
                a.chatPause ||
                a.mailPause ||
                a.smsPause ||
                a.whatsappPause ||
                a.openchannelPause
              ) {
                status = 'Pause';
              } else if (
                a.busy ||
                a.voiceStatus !== 'idle' ||
                a.chatStatus !== 'idle' ||
                a.mailStatus !== 'idle' ||
                a.smsStatus !== 'idle' ||
                a.whatsappStatus !== 'idle' ||
                a.openchannelStatus !== 'idle'
              ) {
                status = 'Busy';
              }

              const totalSeconds = Math.floor(diff / 1000);
              const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
              const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
              const seconds = String(totalSeconds % 60).padStart(2, '0');

              return {
                id: a.id,
                name: a.fullname || a.name,
                status,
                time: `${hours}:${minutes}:${seconds}`
              } as agent;
            });

          const statusOrder: { [key: string]: number } = {
            'Online': 0,
            'Busy': 1,
            'Pause': 2,
            'Offline': 3
          };

          rows.sort((a, b) => {
            const sa = statusOrder[a.status] ?? 99;
            const sb = statusOrder[b.status] ?? 99;

            if (sa !== sb) {
              return sa - sb;
            }

            return a.name.localeCompare(b.name);
          });

          return rows;
        })
      );
  }
}
