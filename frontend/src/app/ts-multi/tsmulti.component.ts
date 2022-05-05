import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { plotlylib } from '../library/plotly';

export interface IplotMulti {
  _id: number;
  items: {
    tag: string;
    yrange?: {
      min: number;
      max: number;
    };
  }[];
  datasets?: Partial<Plotly.PlotData>[];
  layout?: Partial<Plotly.Layout>;
}

@Component({
  selector: 'app-tsmulti',
  templateUrl: './tsmulti.component.html',
  styleUrls: ['./tsmulti.component.css'],
})
export class TsMultiComponent {
  p_lib = new plotlylib();

  @Input() plotInfo?: IplotMulti[];

  @Output() onDeleteChart: EventEmitter<number> = new EventEmitter();
  @Output() onSettingModal: EventEmitter<number> = new EventEmitter();

  constructor() {}

  onClickTrash(id: number) {
    this.onDeleteChart.emit(id);
  }

  onClickEdit(id: number) {
    this.onSettingModal.emit(id);
  }
}
