import { Component } from '@angular/core';
import { Moment } from 'moment';
import { faChartColumn, faChartLine, faCog, faCubes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ts-data-analyzer';
  influxDateRange: string[] = [];
  settingIcon = faCog;
  chartLineIcon = faChartLine;
  cahrtBarIcon = faChartColumn;
  titleIcon = faCubes;

  onDateSelected(DateRange: Moment[]) {
    this.influxDateRange = DateRange.map(itm => itm.toISOString());
  }
}
