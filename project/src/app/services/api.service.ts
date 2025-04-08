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

  public whoAmI(): Observable<agent>
  {
    return this.get('/api/users/whoami')
      .pipe(map(
        res => {
          return res;
        }
      ));
  }

  public getAllAgents(): Observable<agent[]>
  {
    return this.get('/api/users?nolimit=true&sort=id&role=agent')
      .pipe(map(
        res => {
          return res.rows;
        }
      ));
  }

  public getPluginApi(url: string, port: number): Observable<any>
  {
    return this.get(`/api/plugins/webhook?port=${port}&path=${url}`)
      .pipe(map(
        res => {
          return res;
        }
      ));
  }
}
