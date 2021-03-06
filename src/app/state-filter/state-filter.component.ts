import { Component, OnInit, EventEmitter, Output} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-state-filter',
  templateUrl: './state-filter.component.html',
  styleUrls: ['./state-filter.component.css']
})
export class StateFilterComponent implements OnInit {

  // Emitter for updating table with state filter info
  @Output() updateState = new EventEmitter<any>();

  // Lists fetched from api
  public users;
  public appointments;
  public teams: Array<any> = [];

  // Variables decided by user
  public teamId: string;
  public userId: string;
  public currentDate: Date;
  public dateString: string;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.getUsers();
    this.getDate(undefined);
    this.getAppointments();
  }

  form = new FormGroup({
    dropdown: new FormControl('', Validators.required)
  });

  public sendParams(params) {
    this.api.saveParams(params);
    this.updateState.emit(params);
  }

  public applyTeam(item) {
    var team: string = item.target.value;

    function teamIdSearch(team, array) {
      var value = '';
      array.forEach(element => {
        if (element.teamName == team)
          value = element.teamId;
      });
      return value;
    }

    this.teamId = teamIdSearch(team, this.teams)
    this.updateTables();
    this.updateFilters();
  }

  public applyUser(item) {
    var user: string = item.target.value;
    var index = this.users.findIndex(i => i.name == user)
    if (index == -1)
      this.userId = '';
    else
      this.userId = this.users[index].id;
    this.updateTables();
    this.updateFilters();
  }

  public applyDate(item) {
    this.getDate(item.target.value);
    this.updateTables();
    this.updateFilters();
  }

  private getUsers() {
    this.api.query('users').subscribe(Response =>
      this.users = Response)
  }

  private getDate(date) {
    // if undefined or empty set to current date
    if (date == undefined || date == '')
      this.currentDate = new Date();
    else {
      this.currentDate = new Date(date);
    }
    var year = this.currentDate.getFullYear();
    var month = this.currentDate.getMonth() + 1;
    var day = this.currentDate.getUTCDate();

    function addZero(value) {
      if (value < 10)
        return '0' + value
      else
        return value
    }

    month = addZero(month)
    day = addZero(day)
    this.dateString = year + '-' + month + '-' + day;
  }

  public getAppointments(){
    this.api.query('appointments').subscribe(Response => {
      this.appointments = Response;

      if (this.teams.length == 0) {
        var tempSet: Set<String> = new Set();
        function team(id, name) {
          this.teamId = id;
          this.teamName = name;
        }
        this.appointments.forEach(element => {
          var temp = new team(element.teamId, element.teamName);
          temp = JSON.stringify(temp);
          if (tempSet.has(temp) == false) {
            tempSet.add(temp);
            this.teams.push(JSON.parse(temp));
          }
        });
      }
    });
  }

  public updateFilters() {
    // /apps/api/test/filters/?teamId=(teamID)&pickOwner=(userID)&pickDay=(today)

    this.api.stateQuery(this.teamId, this.userId,
      this.dateString)
    .subscribe();
  }

  public updateTables() {
    function stateInfo(team: string, user: string, date: string) {
      if (team == undefined)
        team = '';
      if (user == undefined)
        user = '';
      this.teamId = team;
      this.userId = user;
      this.date = date;
    }
    let update = new stateInfo(this.teamId, this.userId, this.dateString);
    this.sendParams(update);
  }
}
