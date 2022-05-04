import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeforeunloadGuard } from './guards/beforeunload.guard';
import { DataDescriptionComponent } from './data-description/data-description.component';
import { HistogramComponent } from './histogram/histogram.component';
import { TsSingleComponent } from './ts-single/ts-single.component';
import { TsMultiComponent } from './ts-multi/tsmulti.component';
import { ScatterComponent } from './scatter/scatter.component';
import { SettingComponent } from './setting/setting.component';
import { DataAnalyzeComponent } from './data-analyze/data-analyze.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canDeactivate: [BeforeunloadGuard],
  },
  {
    path: 'ts-single',
    component: TsSingleComponent,
    canDeactivate: [BeforeunloadGuard],
  },
  {
    path: 'ts-multi',
    component: TsMultiComponent,
    canDeactivate: [BeforeunloadGuard],
  },
  {
    path: 'histogram',
    component: HistogramComponent,
    canDeactivate: [BeforeunloadGuard],
  },
  {
    path: 'scatter',
    component: ScatterComponent,
    canDeactivate: [BeforeunloadGuard],
  },
  {
    path: 'description',
    component: DataDescriptionComponent,
    canDeactivate: [BeforeunloadGuard],
  },
  {
    path: 'analyze',
    component: DataAnalyzeComponent,
    canDeactivate: [BeforeunloadGuard],
  },
  {
    path: 'setting',
    component: SettingComponent,
    canDeactivate: [BeforeunloadGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
