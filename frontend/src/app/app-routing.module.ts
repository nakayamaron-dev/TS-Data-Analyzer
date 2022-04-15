import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeforeunloadGuard } from './beforeunload.guard';
import { VisualizerComponent } from './visualizer/visualizer.component';

const routes: Routes = [
  {path: '', component: VisualizerComponent, canDeactivate: [BeforeunloadGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
