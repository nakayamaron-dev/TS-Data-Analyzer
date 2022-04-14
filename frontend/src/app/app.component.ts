import { Component } from '@angular/core';
import { Moment } from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ts-data-analyzer';
  influxDateRange: string[] = [];

  onDateSelected(DateRange: Moment[]) {
    this.influxDateRange = DateRange.map(itm => itm.toISOString());
  }
}
