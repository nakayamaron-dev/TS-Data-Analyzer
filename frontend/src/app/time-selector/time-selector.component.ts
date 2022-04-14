import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faClock, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { Moment } from 'moment';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';

// see:https://danielykpan.github.io/date-time-picker/#Use%20picker%20with%20MomentJS
export const MY_MOMENT_FORMATS = {
  parseInput: 'l LT',
  fullPickerInput: 'YYYY/MM/DD HH:mm:ss',
  datePickerInput: 'l',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'app-time-selector',
  templateUrl: './time-selector.component.html',
  styleUrls: ['./time-selector.component.css'],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS }
  ]
})
export class TimeSelectorComponent implements OnInit {

  clockIcon = faClock;
  calendarIcon = faCalendarAlt;

  startAt: Date = new Date();
  influxDateRange: Moment[] = [];

  @Output() TimeSelector: EventEmitter<Moment[]> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {

  }

  onClickTimeSelector() {

  }

  onChangeDateTime() {
    this.TimeSelector.emit(this.influxDateRange);
  }

}
