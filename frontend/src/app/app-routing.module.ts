import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BeforeunloadGuard } from './guards/beforeunload.guard';
import { DataDescriptionComponent } from './data-description/data-description.component';
import { SettingComponent } from './setting/setting.component';
import { DataAnalyzeComponent } from './data-analyze/data-analyze.component';
import { HomeComponent } from './home/home.component';
import { VisualizerComponent } from './visualizer/visualizer.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canDeactivate: [BeforeunloadGuard],
  },
  {
    path: 'charts',
    component: VisualizerComponent,
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
