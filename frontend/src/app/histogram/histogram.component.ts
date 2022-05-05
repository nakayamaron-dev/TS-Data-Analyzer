import {
  Component,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService, IdefaultYranges } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { forkJoin } from 'rxjs';
import { Moment } from 'moment';
import * as moment from 'moment';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';
import { ItagInfo } from '../data-description/data-description.component';
import { plotlylib } from '../library/plotly';

export interface IplotHist {
  _id: number;
  items: {
    tag: string;
    xbin?: {
      end: number;
      size: number;
      start: number;
    };
    bin?: number;
  }[];
  datasets?: Partial<Plotly.PlotData>[];
  layout?: Partial<Plotly.Layout>;
}

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css'],
})
export class HistogramComponent {
  p_lib = new plotlylib();

  @Input() plotInfo?: IplotHist[];

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
