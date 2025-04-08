import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from "@angular/material/table";
import { io, Socket } from "socket.io-client";
import { agent } from './models/agent';
import { ApiService } from "./services/api.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('socketOutput', {read: ElementRef}) socketOutput!: ElementRef<HTMLDivElement>;
  @ViewChild('tailOutput', {read: ElementRef}) tailOutput!: ElementRef<HTMLDivElement>;

  public agents: MatTableDataSource<agent>;
  public displayedColumns = ["id", "name", "email"];
  public quote: string = '';
  public author: string = '';

  /** The connection to the XCALLY socket.io */
  private _xcallyIo?: Socket = undefined;
  /** The connection to the plugin socket.io */
  private _pluginIo?: Socket = undefined;
  title = 'angular-plugin';

  constructor(private _apiService: ApiService) {
    this.agents = new MatTableDataSource();
  }

  ngOnInit(): void {
    this._apiService.whoAmI()
    .subscribe(e => {
      const opts = {
        query: {
          "id": e.id
        },
        transports: ['websocket'],
      };
      this._xcallyIo = io(`wss://${document.location.host}`, opts);
      this._xcallyIo.onAny((eventName, ...args) => {
        this.socketOutput.nativeElement.innerText += `Event: ${eventName} = ${JSON.stringify(args)}\n`;
      });

      this._pluginIo = io(`http://localhost:3200`, opts);
      this._pluginIo.on('new-data', (value, callback) => {
        // New data received for the tail file
        this.tailOutput.nativeElement.innerText += value;
      });
    })

    this._apiService.getAllAgents()
    .subscribe(e => {
      this.agents = new MatTableDataSource(e);
    });

    this._apiService.getPluginApi('/api/test', 3125)
    .subscribe(e => {
      this.quote = e.quote;
      this.author = e.author;
    });
  }
}
