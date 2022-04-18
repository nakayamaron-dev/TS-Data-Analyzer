import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeforeunloadGuard } from './guards/beforeunload.guard';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { DataDescriptionComponent } from './data-description/data-description.component';
import { HistogramComponent } from './histogram/histogram.component';

const routes: Routes = [
  {path: '', component: VisualizerComponent, canDeactivate: [BeforeunloadGuard]},
  {path: 'ts-multi', component: VisualizerComponent, canDeactivate: [BeforeunloadGuard]},
  {path: 'histogram', component: HistogramComponent, canDeactivate: [BeforeunloadGuard]},
  {path: 'setting', component: DataDescriptionComponent, canDeactivate: [BeforeunloadGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
