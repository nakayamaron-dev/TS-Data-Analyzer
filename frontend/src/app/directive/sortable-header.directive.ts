import {Directive, EventEmitter, Input, Output} from '@angular/core';

export type SortColumn<T> = keyof T | '';
export type SortDirection = 'asc' | 'desc' | '';

export interface SortEvent<T> {
  column: SortColumn<T>;
  direction: SortDirection;
}

const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'th[sortable]',
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()'
  }
})
// tslint:disable-next-line:directive-class-suffix
export class SortableHeader<T> {
  @Input() sortable: SortColumn<T> = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent<T>>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({column: this.sortable, direction: this.direction});
  }
}