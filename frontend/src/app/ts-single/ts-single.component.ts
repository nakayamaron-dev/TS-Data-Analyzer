import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { plotlylib } from '../library/plotly';

export interface IplotSingle {
  _id: number;
  tag: string;
  bin?: number;
  xbin?: {
    end: number;
    size: number;
    start: number;
  };
  yrange?: {
    min: number;
    max: number;
  };
  datasets?: Partial<PlotDataTSWithHistogram>[];
  layout?: Partial<Plotly.Layout>;
}

interface PlotDataTSWithHistogram extends Plotly.PlotData {
  ybins?: {
    start: number | string;
    end: number | string;
    size: number | string;
  };
}

@Component({
  selector: 'app-ts-single',
  templateUrl: './ts-single.component.html',
  styleUrls: ['./ts-single.component.css'],
})
export class TsSingleComponent {
  p_lib = new plotlylib();

  @Input() plotInfo?: IplotSingle[];

  @Output() onDeleteChart: EventEmitter<number> = new EventEmitter();
  @Output() onSettingModal: EventEmitter<number> = new EventEmitter();

  onClickTrash(id: number) {
    this.onDeleteChart.emit(id);
  }

  onClickEdit(id: number) {
    this.onSettingModal.emit(id);
  }

  constructor() {}
}
