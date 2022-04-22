import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule }   from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppComponent } from './app.component';
import { TsMultiComponent } from './ts-multi/tsmulti.component';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PlotSetting } from './modal/plot-setting-modal';
import { HistSetting } from './modal/hist-setting-modal';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';
import { DataDescriptionComponent } from './data-description/data-description.component';
import { HistogramComponent } from './histogram/histogram.component';
import { HeaderComponent } from './header/header.component';

PlotlyModule.plotlyjs = PlotlyJS;

// owldatetimeのデフォルトの日付FormatをYYYY/MM/DD HH:mm:ssとする。
// https://danielykpan.github.io/date-time-picker/#Use%20picker%20with%20MomentJS
export const MOMENT_FORMATS = {
  parseInput: 'l LT',
  full: 'YYYY/MM/DD HH:mm',
  datePickerInput: 'l',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
  declarations: [
    AppComponent,
    TsMultiComponent,
    PlotSetting,
    HistSetting,
    DataDescriptionComponent,
    HistogramComponent,
    HeaderComponent,
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
    MatIconModule,
  ],
  providers: [
    {provide: OWL_DATE_TIME_FORMATS, useValue: MOMENT_FORMATS},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
