import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule }   from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppComponent } from './app.component';
import { VisualizerComponent } from './visualizer/visualizer.component';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PlotSetting } from './modal/plot-setting-modal';
import { TimeSelectorComponent } from './time-selector/time-selector.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';

PlotlyModule.plotlyjs = PlotlyJS;

// owldatetimeのデフォルトの日付FormatをYYYY/MM/DD HH:mm:ssとする。
// https://danielykpan.github.io/date-time-picker/#Use%20picker%20with%20MomentJS
export const MY_MOMENT_FORMATS = {
  parseInput: 'l LT',
  fullPickerInput: 'YYYY/MM/DD HH:mm:ss',
  datePickerInput: 'l',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  declarations: [
    AppComponent,
    VisualizerComponent,
    PlotSetting,
    TimeSelectorComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    CommonModule,
    AppRoutingModule,
    PlotlyModule,
    HttpClientModule,
    FontAwesomeModule,
    NgbModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
  ],
  providers: [
    {provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
