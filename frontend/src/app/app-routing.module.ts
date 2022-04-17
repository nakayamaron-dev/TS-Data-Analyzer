import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeforeunloadGuard } from './guards/beforeunload.guard';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { DataDescriptionComponent } from './data-description/data-description.component';

const routes: Routes = [
  {path: '', component: VisualizerComponent, canDeactivate: [BeforeunloadGuard]},
  {path: 'setting', component: DataDescriptionComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
