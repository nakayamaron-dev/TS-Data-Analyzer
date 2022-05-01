import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeforeunloadGuard } from './guards/beforeunload.guard';
import { DataDescriptionComponent } from './data-description/data-description.component';
import { HistogramComponent } from './histogram/histogram.component';
import { TsMultiComponent } from './ts-multi/tsmulti.component';
import { ScatterComponent } from './scatter/scatter.component';

const routes: Routes = [
  {path: '', component: TsMultiComponent, canDeactivate: [BeforeunloadGuard]},
  {path: 'ts-multi', component: TsMultiComponent, canDeactivate: [BeforeunloadGuard]},
  {path: 'histogram', component: HistogramComponent, canDeactivate: [BeforeunloadGuard]},
  {path: 'scatter', component: ScatterComponent, canDeactivate: [BeforeunloadGuard]},
  {path: 'description', component: DataDescriptionComponent, canDeactivate: [BeforeunloadGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
