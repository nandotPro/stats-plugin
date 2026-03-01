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
  public displayedColumns = ["id", "name", "status", "time"];
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
        this.agents.data = rows;
      });
  }
}
