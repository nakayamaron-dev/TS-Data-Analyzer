import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { plotlylib } from '../library/plotly';

export interface IplotScatter {
  _id: number;
  tag_x: string;
  tag_y: string;
  xrange?: {
    min: number;
    max: number;
  };
  yrange?: {
    min: number;
    max: number;
  };
  datasets?: Partial<Plotly.PlotData>[];
  layout?: Partial<Plotly.Layout>;
}

@Component({
  selector: 'app-scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.css'],
})
export class ScatterComponent {
  p_lib = new plotlylib();

  @Input() plotInfo?: IplotScatter[];

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
