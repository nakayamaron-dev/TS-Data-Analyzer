import { Component, OnInit, HostListener } from '@angular/core';
import { Moment } from 'moment';
import * as moment from 'moment';
import { plotlylib } from '../library/plotly';
import { IgeneralSetting, MongoService } from '../service/mongo.service';
import { IdefaultYranges, InfluxService } from '../service/influx.service';
import { ModalService } from '../service/modal.service';
import { ItagInfo } from '../data-description/data-description.component';
import { IplotSingle } from '../ts-single/ts-single.component';
import { IplotMulti } from '../ts-multi/tsmulti.component';
import { IplotHist } from '../histogram/histogram.component';
import { IplotScatter } from '../scatter/scatter.component';
import { forkJoin, of } from 'rxjs';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';

export const MOMENT_FORMATS = 'YYYY/MM/DD HH:mm';
type pTitle = Partial<Plotly.DataTitle>;
type pLayout = Partial<Plotly.Layout>;

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css'],
  providers: [{ provide: OWL_DATE_TIME_FORMATS, useValue: MOMENT_FORMATS }],
})
export class VisualizerComponent implements OnInit {
  p_lib = new plotlylib();
  tabs = ['show_chart', 'stacked_line_chart', 'bar_chart', 'scatter_plot'];
  active_tab = this.tabs[0];
  placeholder = '';
  isUnSaved = false;
  tagInfo?: ItagInfo;
  tagList: string[] = [];
  yrangeList?: IdefaultYranges;
  defaultXrange: Moment[] = [];
  genSets?: IgeneralSetting;
  SingleInfo: IplotSingle[] = [];
  MultiInfo: IplotMulti[] = [];
  HistoInfo: IplotHist[] = [];
  ScatterInfo: IplotScatter[] = [];
  deleteBufferTSSingle: IplotSingle[] = [];
  deleteBufferTSMulti: IplotMulti[] = [];
  deleteBufferHistogram: IplotHist[] = [];
  deleteBufferScatter: IplotScatter[] = [];

  constructor(
    private mongo: MongoService,
    private influx: InfluxService,
    private modal: ModalService
  ) {}

  async ngOnInit() {
    await this.initialize();
    this.updateAllChart();
  }

  async initialize() {
    this.genSets = await this.mongo.getGeneralSettings().toPromise();
    this.tagInfo = await this.mongo.getTagInfo().toPromise();
    this.tagList = this.tagInfo!.items.map((itm) => itm.tag);
    this.yrangeList = await this.influx.getYrangeList(this.tagList).toPromise();
    const latestTS = await this.influx.getLatestTimeStamp().toPromise();
    this.defaultXrange = [moment(latestTS).subtract(1, 'd'), moment(latestTS)];
    this.placeholder = this.getTimePlaceholderValue(
      this.genSets!.dateRange
        ? this.genSets!.dateRange.map((itm) => moment(itm))
        : this.defaultXrange,
      MOMENT_FORMATS
    );
  }

  async updateAllChart() {
    switch (this.active_tab) {
      case 'show_chart':
        this.mongo.getTSSingleInfoAll().subscribe((res) => {
          this.SingleInfo = res;
          this.SingleInfo.forEach((gInfo) => {
            this.updateTSSingleChart(gInfo);
          });
        });
        return;
      case 'stacked_line_chart':
        this.mongo.getTSmultiInfoAll().subscribe((res) => {
          this.MultiInfo = res;
          this.MultiInfo.forEach((gInfo) => {
            this.updateTSMultiChart(gInfo);
          });
        });
        return;
      case 'bar_chart':
        this.mongo.getHistogramInfo().subscribe((res) => {
          this.HistoInfo = res;
          this.HistoInfo.forEach((gInfo) => {
            this.updateHistogramChart(gInfo);
          });
        });
        return;
      case 'scatter_plot':
        this.mongo.getScatterInfo().subscribe((res) => {
          this.ScatterInfo = res;
          this.ScatterInfo.forEach((gInfo) => {
            this.updateScatterChart(gInfo);
          });
        });
        return;
    }
  }

  updateSingleChart(
    gInfo: IplotSingle | IplotMulti | IplotHist | IplotScatter
  ) {
    switch (this.active_tab) {
      case 'show_chart':
        this.updateTSSingleChart(gInfo as IplotSingle);
        return;
      case 'stacked_line_chart':
        this.updateTSMultiChart(gInfo as IplotMulti);
        return;
      case 'bar_chart':
        this.updateHistogramChart(gInfo as IplotHist);
        return;
      case 'scatter_plot':
        this.updateScatterChart(gInfo as IplotScatter);
        return;
    }
  }

  updateTSSingleChart(gInfo: IplotSingle) {
    const [From, To] = this.getFromTo();
    gInfo.datasets = [];

    this.influx.getHistoricalData([gInfo.tag], From, To).subscribe((res) => {
      const x = res[gInfo.tag] ? res[gInfo.tag].map((t) => t.timeStamp) : [];
      const y = res[gInfo.tag] ? res[gInfo.tag].map((itm) => itm.value) : [];
      const max = Math.max(...y);
      const min = Math.min(...y);
      const xbin = {
        end: gInfo.xbin ? gInfo.xbin.end : max,
        size: gInfo.xbin ? gInfo.xbin.size : (max - min) / 15,
        start: gInfo.xbin ? gInfo.xbin.start : min,
      };
      gInfo.datasets!.push({
        x: x,
        y: y,
        name: gInfo.tag,
      });

      gInfo.datasets!.push({
        y: y,
        xaxis: 'x2',
        type: 'histogram',
        showlegend: false,
        opacity: 0.5,
        marker: { color: this.p_lib.plotColors[0] },
        ybins: xbin,
      });

      if (!gInfo.yrange) {
        gInfo.yrange = { min: min, max: max };
      }

      if (!gInfo.xbin) {
        gInfo.xbin = xbin;
      }

      if (!gInfo.bin) {
        gInfo.bin = Math.round((max - min) / xbin.size);
      }

      gInfo.layout = this.setLayoutTSSingle(gInfo);
    });
  }

  updateTSMultiChart(gInfo: IplotMulti) {
    const tagList = gInfo.items.map((itm) => itm.tag);
    const [From, To] = this.getFromTo();
    gInfo.datasets = [];

    this.influx.getHistoricalData(tagList, From, To).subscribe((res) => {
      gInfo.items.forEach((i, idx) => {
        const x = res[i.tag] ? res[i.tag].map((t) => t.timeStamp) : [];
        const y = res[i.tag] ? res[i.tag].map((itm) => itm.value) : [];

        gInfo.datasets!.push({
          x: x,
          y: y,
          name: i.tag,
          yaxis: `y${idx + 1}`,
        });

        if (!i.yrange) {
          i.yrange = {
            min: Math.min(...y),
            max: Math.max(...y),
          };
        }

        gInfo.layout = this.setLayoutTSMulti(gInfo);
      });
    });
  }

  updateHistogramChart(gInfo: IplotHist) {
    const tagList = gInfo.items.map((itm) => itm.tag);
    const [From, To] = this.getFromTo();
    gInfo.datasets = [];

    this.influx.getHistoricalData(tagList, From, To).subscribe((res) => {
      gInfo.items.forEach((item, idx) => {
        const x = res[item.tag] ? res[item.tag].map((itm) => itm.value) : [];
        const max = Math.max(...x);
        const min = Math.min(...x);
        const xbin = {
          end: item.xbin ? item.xbin.end : max,
          size: item.xbin ? item.xbin.size : (max - min) / 15,
          start: item.xbin ? item.xbin.start : min,
        };

        gInfo.datasets!.push({
          x: x,
          name: item.tag,
          type: 'histogram',
          xaxis: `x${idx + 1}`,
          opacity: 0.5,
          marker: { color: this.p_lib.plotColors[idx] },
          xbins: xbin,
        });

        if (!item.xbin) {
          item.xbin = xbin;
        }

        if (!item.bin) {
          item.bin = Math.round((max - min) / xbin.size);
        }

        gInfo.layout = this.setLayoutHistogram();
      });
    });
  }

  updateScatterChart(gInfo: IplotScatter) {
    const tagList = [gInfo.tag_x, gInfo.tag_y];
    const [From, To] = this.getFromTo();
    gInfo.datasets = [];

    this.influx.getHistoricalData(tagList, From, To).subscribe((res) => {
      const x = res[gInfo.tag_x] ? res[gInfo.tag_x].map((t) => t.value) : [];
      const y = res[gInfo.tag_y] ? res[gInfo.tag_y].map((t) => t.value) : [];

      gInfo.datasets!.push({
        x: x,
        y: y,
        name: gInfo.tag_x,
        mode: 'markers',
        type: 'scatter',
        marker: { size: 5 },
      });

      if (!gInfo.yrange) {
        const max_y = Math.max(...y);
        const min_y = Math.min(...y);
        const space_y = 0.1 * (max_y - min_y);
        gInfo.yrange = {
          min: Number((min_y - space_y).toFixed(2)),
          max: Number((max_y + space_y).toFixed(2)),
        };
      }

      if (!gInfo.xrange) {
        const max_x = Math.max(...x);
        const min_x = Math.min(...x);
        const space_x = 0.1 * (max_x - min_x);
        gInfo.xrange = {
          min: Number((min_x - space_x).toFixed(2)),
          max: Number((max_x + space_x).toFixed(2)),
        };
      }

      gInfo.layout = this.setLayoutScatter(gInfo);
    });
  }

  setLayoutTSSingle(gInfo: IplotSingle) {
    const layout: pLayout = this.p_lib.getTSSingleLayout();
    const unit = this.tagInfo?.items.find((a) => a.tag === gInfo.tag)?.unit;
    (layout.yaxis!.title as pTitle).text = unit;
    layout.yaxis!.range = [gInfo.yrange!.min, gInfo.yrange!.max];

    return layout;
  }

  setLayoutTSMulti(gInfo: IplotMulti) {
    const layout: pLayout = this.p_lib.getTsMultiLayout();

    gInfo.items.forEach((itm, idx) => {
      const unit = this.tagInfo?.items.find((a) => a.tag === itm.tag)?.unit;
      switch (idx) {
        case 0:
          (layout.yaxis!.title as pTitle).text = unit;
          layout.yaxis!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 1:
          (layout.yaxis2!.title as pTitle).text = unit;
          layout.yaxis2!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 2:
          (layout.yaxis3!.title as pTitle).text = unit;
          layout.yaxis3!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 3:
          (layout.yaxis4!.title as pTitle).text = unit;
          layout.yaxis4!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 4:
          (layout.yaxis5!.title as pTitle).text = unit;
          layout.yaxis5!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 5:
          (layout.yaxis6!.title as pTitle).text = unit;
          layout.yaxis6!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
      }
    });
    return layout;
  }

  setLayoutHistogram() {
    return this.p_lib.getHistogramLayout();
  }

  setLayoutScatter(gInfo: IplotScatter, xtitle?: string, ytitle?: string) {
    const layout = this.p_lib.getScatterLayout();
    (layout.xaxis?.title as pTitle).text = xtitle ? xtitle : gInfo.tag_x;
    (layout.yaxis?.title as pTitle).text = ytitle ? ytitle : gInfo.tag_y;
    layout.yaxis!.range = [gInfo.yrange!.min, gInfo.yrange!.max];
    layout.xaxis!.range = [gInfo.xrange!.min, gInfo.xrange!.max];
    return layout;
  }

  changeTab(tab: any) {
    this.active_tab = tab;
    this.updateAllChart();
  }

  onChangeDateTime(xrange: Moment[]) {
    this.isUnSaved = true;
    this.genSets!.dateRange = [
      xrange[0].toISOString(),
      xrange[1].toISOString(),
    ];
    this.updateAllChart();
  }

  onClickChangeViewMode(viewTag: boolean) {
    switch (this.active_tab) {
      case 'show_chart':
        this.changeViewModeTSSingle(viewTag);
        return;
      case 'stacked_line_chart':
        this.changeViewModeTSMulti(viewTag);
        return;
      case 'bar_chart':
        this.changeViewModeHistogram(viewTag);
        return;
      case 'scatter_plot':
        this.changeViewModeScatter(viewTag);
        return;
    }
  }

  changeViewModeTSSingle(viewTag: boolean) {
    this.SingleInfo.forEach((p) => {
      const d = this.tagInfo?.items.find((i) => i.tag === p.tag)?.description;
      p.datasets![0].name = viewTag ? p.tag : d;
    });
  }

  changeViewModeTSMulti(viewTag: boolean) {
    this.MultiInfo.forEach((p) => {
      p.items.forEach((t, idx) => {
        const d = this.tagInfo?.items.find((i) => i.tag === t.tag)?.description;
        p.datasets![idx].name = viewTag ? t.tag : d;
      });
    });
  }

  changeViewModeHistogram(viewTag: boolean) {
    this.HistoInfo.forEach((p) => {
      p.items.forEach((t, idx) => {
        const d = this.tagInfo?.items.find((i) => i.tag === t.tag)?.description;
        p.datasets![idx].name = viewTag ? t.tag : d;
      });
    });
  }

  changeViewModeScatter(viewTag: boolean) {
    this.ScatterInfo.forEach((p) => {
      const x = this.tagInfo?.items.find((i) => i.tag === p.tag_x)?.description;
      const y = this.tagInfo?.items.find((i) => i.tag === p.tag_y)?.description;
      const xtitle = viewTag ? p.tag_x : x;
      const ytitle = viewTag ? p.tag_y : y;
      p.layout = this.setLayoutScatter(p, xtitle!, ytitle!);
    });
  }

  onClickAddChart() {
    switch (this.active_tab) {
      case 'show_chart':
        this.addTSSingleChart();
        return;
      case 'stacked_line_chart':
        this.addTSMultiChart();
        return;
      case 'bar_chart':
        this.addHistogramChart();
        return;
      case 'scatter_plot':
        this.addScatterChart();
        return;
    }
  }

  addTSSingleChart() {
    this.isUnSaved = true;
    const newItem: IplotSingle = {
      _id: this.SingleInfo.slice(-1)[0]._id + 1,
      tag: this.tagList[0],
      yrange: {
        min: this.yrangeList![this.tagList[0]].min,
        max: this.yrangeList![this.tagList[0]].max,
      },
    };
    this.SingleInfo.push(newItem);
    this.updateSingleChart(newItem);
  }

  addTSMultiChart() {
    this.isUnSaved = true;
    const newItem: IplotMulti = {
      _id: this.MultiInfo.slice(-1)[0]._id + 1,
      items: [
        {
          tag: this.tagList[0],
          yrange: {
            min: this.yrangeList![this.tagList[0]].min,
            max: this.yrangeList![this.tagList[0]].max,
          },
        },
      ],
    };
    this.MultiInfo.push(newItem);
    this.updateSingleChart(newItem);
  }

  addHistogramChart() {
    this.isUnSaved = true;
    const newItem: IplotHist = {
      _id: this.HistoInfo.slice(-1)[0]._id + 1,
      items: [{ tag: this.tagList[0] }],
    };
    this.HistoInfo.push(newItem);
    this.updateSingleChart(newItem);
  }

  addScatterChart() {
    this.isUnSaved = true;
    const newItem: IplotScatter = {
      _id: this.ScatterInfo.slice(-1)[0]._id + 1,
      tag_x: this.tagList[0],
      tag_y: this.tagList[1],
    };
    this.ScatterInfo.push(newItem);
    this.updateSingleChart(newItem);
  }

  onClickTrash(idx: number) {
    if (confirm('Are you sure to delete?')) {
      switch (this.active_tab) {
        case 'show_chart':
          return this.deleteTSSingleChart(idx);
        case 'stacked_line_chart':
          return this.deleteTSMultiChart(idx);
        case 'bar_chart':
          return this.deleteHistogramChart(idx);
        case 'scatter_plot':
          return this.deleteScatterChart(idx);
      }
    }
  }

  deleteTSSingleChart(idx: number) {
    this.isUnSaved = true;
    this.deleteBufferTSSingle.push(this.SingleInfo[idx]);
    this.SingleInfo.splice(idx, 1);
  }

  deleteTSMultiChart(idx: number) {
    this.isUnSaved = true;
    this.deleteBufferTSMulti.push(this.MultiInfo[idx]);
    this.MultiInfo.splice(idx, 1);
  }

  deleteHistogramChart(idx: number) {
    this.isUnSaved = true;
    this.deleteBufferHistogram.push(this.HistoInfo[idx]);
    this.HistoInfo.splice(idx, 1);
  }

  deleteScatterChart(idx: number) {
    this.isUnSaved = true;
    this.deleteBufferScatter.push(this.ScatterInfo[idx]);
    this.ScatterInfo.splice(idx, 1);
  }

  onClickSave() {
    forkJoin([
      this.mongo.updateGeneralSettings(this.genSets!),
      this.deleteChartInfo(),
      this.saveChartInfo(),
    ]).subscribe(
      (_) => {
        this.isUnSaved = false;
        this.modal.message('Saved', 'Saved successfully.').then().catch();
      },
      (_) => {
        this.modal.message('Error', 'Save Failed.').then().catch();
      }
    );
  }

  saveChartInfo() {
    switch (this.active_tab) {
      case 'show_chart':
        return this.mongo.updateTSSingleInfo(this.SingleInfo);
      case 'stacked_line_chart':
        return this.mongo.updateTSmultiInfo(this.MultiInfo);
      case 'bar_chart':
        return this.mongo.updateHistogramInfo(this.HistoInfo);
      case 'scatter_plot':
        return this.mongo.updateScatterInfo(this.ScatterInfo);
      default:
        return of();
    }
  }

  deleteChartInfo() {
    switch (this.active_tab) {
      case 'show_chart':
        return this.mongo.deleteTSSingleInfo(this.deleteBufferTSSingle);
      case 'stacked_line_chart':
        return this.mongo.deleteTSmultiInfo(this.deleteBufferTSMulti);
      case 'bar_chart':
        return this.mongo.deleteHistogramInfo(this.deleteBufferHistogram);
      case 'scatter_plot':
        return this.mongo.deleteScatterInfo(this.deleteBufferScatter);
      default:
        return of();
    }
  }

  onClickEdit(idx: number) {
    switch (this.active_tab) {
      case 'show_chart':
        return this.TSSingleSettingModal(idx);
      case 'stacked_line_chart':
        return this.TSSingleSettingModal(idx);
      case 'bar_chart':
        return this.histogramSettingModal(idx);
      case 'scatter_plot':
        return this.scatterSettingModal(idx);
    }
  }

  TSSingleSettingModal(n: number) {
    this.modal
      .singleSettingModal(this.SingleInfo[n], this.tagList, this.yrangeList!)
      .then(
        (res) => {
          this.isUnSaved = true;
          this.SingleInfo[n] = res;
          this.updateSingleChart(this.SingleInfo[n]);
        },
        (err) => {}
      );
  }

  TSMultiSettingModal(n: number) {
    this.modal
      .multiSettingModal(this.MultiInfo[n], this.tagList, this.yrangeList!)
      .then(
        (res) => {
          this.isUnSaved = true;
          this.MultiInfo[n] = res;
          this.updateSingleChart(this.MultiInfo[n]);
        },
        (err) => {}
      );
  }

  scatterSettingModal(n: number) {
    this.modal
      .scatterSettingModal(this.ScatterInfo[n], this.tagList, this.yrangeList!)
      .then(
        (res) => {
          this.isUnSaved = true;
          this.ScatterInfo[n] = res;
          this.updateSingleChart(this.ScatterInfo[n]);
        },
        (err) => {}
      );
  }

  histogramSettingModal(n: number) {
    this.modal
      .histoSettingModal(this.HistoInfo[n], this.tagList, this.yrangeList!)
      .then(
        (res) => {
          this.isUnSaved = true;
          this.HistoInfo[n] = res;
          this.updateSingleChart(this.HistoInfo[n]);
        },
        (err) => {}
      );
  }

  getFromTo() {
    const From = this.genSets?.dateRange
      ? this.genSets?.dateRange[0]
      : this.defaultXrange[0].toISOString();
    const To = this.genSets?.dateRange
      ? this.genSets?.dateRange[1]
      : this.defaultXrange[1].toISOString();

    return [From, To];
  }

  getTimePlaceholderValue(xrange: Moment[], format: string): string {
    let ret = moment(xrange[0]).format(format);
    ret += ' ~ ';
    ret += moment(xrange[1]).format(format);
    return ret;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event) {
    if (this.isUnSaved) {
      e.returnValue = true;
    }
  }
}
