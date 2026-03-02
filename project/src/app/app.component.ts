import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { agent } from './models/agent';
import { ApiService } from "./services/api.service";
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public agents: MatTableDataSource<agent>;
  public allAgents: agent[] = [];
  public showOffline = true;
  public displayedColumns = ["id", "name", "accountCode", "status", "time"];
  title = 'Agent Presence';

  constructor(private _apiService: ApiService) {
    this.agents = new MatTableDataSource();
  }

  ngOnInit(): void {
    interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this._apiService.getAgentPresence())
      )
      .subscribe(rows => {
        this.allAgents = rows;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    const filtered = this.showOffline
      ? this.allAgents
      : this.allAgents.filter(a => a.status !== 'Offline');

    this.agents.data = filtered;
  }

  onShowOfflineChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.showOffline = !!input?.checked;
    this.applyFilters();
  }
}
