import { Component, OnInit, HostListener } from '@angular/core';
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

export interface IplotSingle {
  _id: number;
  dateRange?: string[];
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

export const MOMENT_FORMATS = 'YYYY/MM/DD HH:mm';

@Component({
  selector: 'app-ts-single',
  templateUrl: './ts-single.component.html',
  styleUrls: ['./ts-single.component.css'],
  providers: [{ provide: OWL_DATE_TIME_FORMATS, useValue: MOMENT_FORMATS }],
})
export class TsSingleComponent implements OnInit {
  isUnSaved = false;
  p_lib = new plotlylib();
  tagList: string[] = [];
  yrangeList: IdefaultYranges = {};
  plotInfo: IplotSingle[] = [];
  deleteBuffer: IplotSingle[] = [];
  defaultXrange: Moment[] = [];
  xrange: Moment[] = [];
  placeholder: string = '';
  tagInfo?: ItagInfo;
  viewTag: boolean = true;

  constructor(
    private influx: InfluxService,
    private mongo: MongoService,
    private modal: ModalService
  ) {}

  updateAllGraph(): void {
    this.plotInfo.forEach((graphInfo) => {
      this.updateSingleGraph(graphInfo);
    });
  }

  updateSingleGraph(graphInfo: IplotSingle) {
    const From =
      graphInfo.dateRange?.length === 2
        ? graphInfo.dateRange[0]
        : this.defaultXrange[0].toISOString();
    const To =
      graphInfo.dateRange?.length === 2
        ? graphInfo.dateRange[1]
        : this.defaultXrange[1].toISOString();
    graphInfo.datasets = [];

    this.influx
      .getHistoricalData([graphInfo.tag], From, To)
      .subscribe((res) => {
        const x = res[graphInfo.tag]
          ? res[graphInfo.tag].map((itm) => itm.timeStamp)
          : [];
        const y = res[graphInfo.tag]
          ? res[graphInfo.tag].map((itm) => itm.value)
          : [];
        const max = Math.max(...y);
        const min = Math.min(...y);
        const xbin = {
          end: graphInfo.xbin ? graphInfo.xbin.end : max,
          size: graphInfo.xbin ? graphInfo.xbin.size : (max - min) / 15,
          start: graphInfo.xbin ? graphInfo.xbin.start : min,
        };

        graphInfo.datasets!.push({
          x: x,
          y: y,
          name: graphInfo.tag,
        });

        graphInfo.datasets!.push({
          y: y,
          xaxis: 'x2',
          type: 'histogram',
          showlegend: false,
          marker: { color: this.p_lib.plotColors[0] },
          ybins: xbin,
        });

        if (!graphInfo.yrange) {
          graphInfo.yrange = {
            min: Math.min(...y),
            max: Math.max(...y),
          };
        }

        if (!graphInfo.xbin) {
          graphInfo.xbin = xbin;
        }

        if (!graphInfo.bin) {
          graphInfo.bin = Math.round((max - min) / xbin.size);
        }

        graphInfo.layout = this.setLayout(graphInfo);
      });
  }

  setLayout(graphInfo: IplotSingle) {
    const layout: Partial<Plotly.Layout> = this.p_lib.getTSSingleLayout();
    const unit = this.tagInfo?.items.find((a) => a.tag === graphInfo.tag)?.unit;

    (layout.yaxis!.title as Partial<Plotly.DataTitle>).text = unit;
    layout.yaxis!.range = [graphInfo.yrange!.min, graphInfo.yrange!.max];

    return layout;
  }

  async ngOnInit() {
    await this.setBaseData();
    this.updateAllGraph();
  }

  async setBaseData() {
    this.tagInfo = (await this.mongo.getTagInfo().toPromise()) as ItagInfo;
    this.tagList = this.tagInfo.items.map((itm) => itm.tag);
    this.yrangeList = (await this.influx
      .getDefaultYrangeList(this.tagList)
      .toPromise()) as IdefaultYranges;
    const latestTimeStamp = (await this.influx
      .getLatestTimeStamp()
      .toPromise()) as string;
    this.defaultXrange = [
      moment(latestTimeStamp).subtract(1, 'd'),
      moment(latestTimeStamp),
    ];
    this.plotInfo = (await this.mongo
      .getTSSingleInfoAll()
      .toPromise()) as IplotSingle[];
    this.xrange = this.plotInfo[0].dateRange
      ? this.plotInfo[0].dateRange.map((itm) => moment(itm))
      : [];
    this.placeholder = this.p_lib.getTimePlaceholderValue(
      this.xrange,
      MOMENT_FORMATS
    );
  }

  addGraph() {
    this.isUnSaved = true;
    const newItem: IplotSingle = {
      _id: this.plotInfo.slice(-1)[0]._id + 1,
      tag: this.tagList[0],
      yrange: {
        min: this.yrangeList[this.tagList[0]].min,
        max: this.yrangeList[this.tagList[0]].max,
      },
      dateRange: [this.xrange[0].toISOString(), this.xrange[1].toISOString()],
    };
    this.plotInfo.push(newItem);
    this.updateSingleGraph(newItem);
  }

  deleteGraph(idx: number) {
    // show confirm message before deleting graph.
    if (confirm('Are you sure to delete?')) {
      this.isUnSaved = true;
      this.deleteBuffer.push(this.plotInfo[idx]);
      this.plotInfo.splice(idx, 1);
    }
  }

  save() {
    forkJoin([
      this.mongo.deleteTSSingleInfo(this.deleteBuffer),
      this.mongo.updateTSSingleInfo(this.plotInfo),
    ]).subscribe(
      (_) => {
        this.isUnSaved = false;
        this.modal
          .message('Saved', 'This dashboard was saved successfully.')
          .then()
          .catch();
      },
      (err) => {
        this.modal
          .message('Error', 'Save Failed. Something is wrong.')
          .then()
          .catch();
      }
    );
  }

  onChangeDateTime(xrange: Moment[]) {
    this.isUnSaved = true;
    this.xrange = xrange;
    this.placeholder = this.p_lib.getTimePlaceholderValue(
      this.xrange,
      MOMENT_FORMATS
    );
    this.plotInfo = this.plotInfo.map((itm) => {
      itm.dateRange = [xrange[0].toISOString(), xrange[1].toISOString()];
      return itm;
    });
    this.updateAllGraph();
  }

  changeViewMode(viewTag: boolean) {
    this.plotInfo.forEach((pInfo) => {
      pInfo.datasets![0].name = viewTag
        ? pInfo.tag
        : this.tagInfo?.items.find((info) => info.tag === pInfo.tag)
            ?.description;
    });
  }

  plotSettingModal(idx: number) {
    this.modal
      .plotSingleSettingModal(this.plotInfo[idx], this.tagList, this.yrangeList)
      .then(
        (res) => {
          this.isUnSaved = true;
          this.plotInfo[idx] = res;
          this.updateSingleGraph(this.plotInfo[idx]);
        },
        (err) => {}
      );
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event) {
    if (this.isUnSaved) {
      e.returnValue = true;
    }
  }
}
