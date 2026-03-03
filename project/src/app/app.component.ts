import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  public agents: MatTableDataSource<agent>;
  public allAgents: agent[] = [];
  public statusSortMode: 'default' | 'busyFirst' | 'pauseFirst' = 'default';
  public displayedColumns = ["id", "name", "accountCode", "status", "time"];
  readonly pageSize = 20;
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

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.agents.paginator = this.paginator;
    }
  }

  applyFilters(): void {
    const filtered = this.allAgents.filter(a => a.status !== 'Offline');

    const statusOrderDefault: { [key: string]: number } = {
      'Online': 0,
      'Busy': 1,
      'Pause': 2,
      'Offline': 3
    };

    const statusOrderBusyFirst: { [key: string]: number } = {
      'Busy': 0,
      'Online': 1,
      'Pause': 2,
      'Offline': 3
    };

    const statusOrderPauseFirst: { [key: string]: number } = {
      'Pause': 0,
      'Online': 1,
      'Busy': 2,
      'Offline': 3
    };

    const orderMap =
      this.statusSortMode === 'busyFirst'
        ? statusOrderBusyFirst
        : this.statusSortMode === 'pauseFirst'
          ? statusOrderPauseFirst
          : statusOrderDefault;

    const sorted = [...filtered].sort((a, b) => {
      const sa = orderMap[a.status] ?? 99;
      const sb = orderMap[b.status] ?? 99;

      if (sa !== sb) {
        return sa - sb;
      }

      return a.name.localeCompare(b.name);
    });

    this.agents.data = sorted;
  }

  onStatusSortToggle(): void {
    if (this.statusSortMode === 'default') {
      this.statusSortMode = 'busyFirst';
    } else if (this.statusSortMode === 'busyFirst') {
      this.statusSortMode = 'pauseFirst';
    } else {
      this.statusSortMode = 'default';
    }

    this.applyFilters();
  }
}
