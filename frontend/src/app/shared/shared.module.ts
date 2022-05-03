import { NgModule } from '@angular/core';
import { SortableHeader } from '../directive/sortable-header.directive';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@NgModule({
  declarations: [SortableHeader],
  imports: [TooltipModule.forRoot(), PaginationModule.forRoot()],
  exports: [SortableHeader, TooltipModule, PaginationModule],
})
export class SharedModule {}
