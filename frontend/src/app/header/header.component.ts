import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faClock, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { Moment } from 'moment';

export const MOMENT_FORMATS = 'YYYY/MM/DD HH:mm';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  viewModeIcon = faExchangeAlt;
  clockIcon = faClock;
  viewTag: boolean = true;
  xrange: Moment[] = [];

  @Input() placeholder: string = '';

  @Output() onSelectDatetime: EventEmitter<Moment[]> = new EventEmitter();
  @Output() onClickViewMode: EventEmitter<boolean> = new EventEmitter();
  @Output() onClickAddChart: EventEmitter<void> = new EventEmitter();
  @Output() onClickSave: EventEmitter<void> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  save() {
    this.onClickSave.emit();
  }

  addGraph() {
    this.onClickAddChart.emit();
  }

  changeViewMode() {
    this.viewTag = !this.viewTag;
    this.onClickViewMode.emit(this.viewTag);
  }

  onChangeDateTime() {
    this.onSelectDatetime.emit(this.xrange);
  }
}
