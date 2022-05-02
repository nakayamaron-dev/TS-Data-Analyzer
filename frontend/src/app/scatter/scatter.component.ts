import { Component, OnInit, HostListener } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService, IdefaultYranges } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { plotlylib } from '../library/plotly';
import { ItagInfo } from '../data-description/data-description.component';
import { forkJoin } from 'rxjs';
import { Moment } from 'moment';
import * as moment from 'moment';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';

export interface IplotScatter {
  _id: number,
  tag_x: string,
  tag_y: string,
  xrange?: {
    min: number,
    max: number
  },
  yrange?: {
      min: number,
      max: number
  },
  dateRange?: string[],
  datasets?: Partial<Plotly.PlotData>[],
  layout?: Partial<Plotly.Layout>
}

export const MOMENT_FORMATS = 'YYYY/MM/DD HH:mm';

@Component({
  selector: 'app-scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.css'],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MOMENT_FORMATS }
  ]
})
export class ScatterComponent implements OnInit {

  p_lib = new plotlylib();
  isUnSaved = false;
  tagList: string[] = [];
  yrangeList: IdefaultYranges = {};
  plotInfo: IplotScatter[] = [];
  deleteBuffer: IplotScatter[] = [];
  defaultXrange: Moment[] = [];
  xrange: Moment[] = [];
  placeholder: string = '';
  tagInfo?: ItagInfo;
  viewTag: boolean = true;

  constructor(private influx: InfluxService, private mongo: MongoService, private modal: ModalService) { }

  async ngOnInit() {
    await this.setBaseData();
    this.updateAllGraph();
  }

  async setBaseData() {
    this.tagInfo = await this.mongo.getTagInfo().toPromise() as ItagInfo;
    this.tagList = this.tagInfo.items.map(itm => itm.tag);
    this.yrangeList = await this.influx.getDefaultYrangeList(this.tagList).toPromise() as IdefaultYranges;
    this.plotInfo = await this.mongo.getScatterInfo().toPromise() as IplotScatter[];
    const latestTimeStamp = await this.influx.getLatestTimeStamp().toPromise() as string;
    this.defaultXrange = [moment(latestTimeStamp).subtract(1, 'd'), moment(latestTimeStamp)];
    this.xrange = this.plotInfo[0].dateRange?.length === 2? this.plotInfo[0].dateRange.map(itm => moment(itm)): this.defaultXrange;
    this.placeholder = this.p_lib.getTimePlaceholderValue(this.xrange, MOMENT_FORMATS);
  }

  updateAllGraph(): void {
    this.plotInfo.forEach(graphInfo => {
      this.updateSingleGraph(graphInfo);
    })
  }

  updateSingleGraph(graphInfo: IplotScatter) {
    const tagList = [graphInfo.tag_x, graphInfo.tag_y];
    const From = graphInfo.dateRange?.length === 2? graphInfo.dateRange[0]: this.defaultXrange[0].toISOString();
    const To = graphInfo.dateRange?.length === 2? graphInfo.dateRange[1]: this.defaultXrange[1].toISOString();
    graphInfo.datasets = [];

    this.influx.getHistoricalData(tagList, From, To).subscribe(res => {
      const x = res[graphInfo.tag_x]? res[graphInfo.tag_x].map(itm => itm.value): [];
      const y = res[graphInfo.tag_y]? res[graphInfo.tag_y].map(itm => itm.value): [];      

      graphInfo.datasets!.push(
        {
          x: x,
          y: y,
          name: graphInfo.tag_x,
          mode: 'markers',
          type: 'scatter',
          marker: {
            size: 5
          },
        }
      )

      if (!graphInfo.yrange) {
        const max_y = Math.max(...y);
        const min_y = Math.min(...y);
        const space_y = 0.1 * (max_y - min_y);
        graphInfo.yrange = {
          min: Number((min_y - space_y).toFixed(2)),
          max: Number((max_y + space_y).toFixed(2))
        }
      }

      if (!graphInfo.xrange) {
        const max_x = Math.max(...x);
        const min_x = Math.min(...x);
        const space_x = 0.1 * (max_x - min_x);
        graphInfo.xrange = {
          min: Number((min_x - space_x).toFixed(2)),
          max: Number((max_x + space_x).toFixed(2))
        }
      }

      graphInfo.layout = this.setLayout(graphInfo);
    })
  }

  setLayout(graphInfo: IplotScatter, xtitle?: string, ytitle?: string) {
    const layout = this.p_lib.getScatterLayout();
    (layout.xaxis?.title as Partial<Plotly.DataTitle>).text = xtitle? xtitle: graphInfo.tag_x;
    (layout.yaxis?.title as Partial<Plotly.DataTitle>).text = ytitle? ytitle: graphInfo.tag_y;
    layout.yaxis!.range = [graphInfo.yrange!.min, graphInfo.yrange!.max];
    layout.xaxis!.range = [graphInfo.xrange!.min, graphInfo.xrange!.max];
    return layout;
  }

  addGraph() {
    this.isUnSaved = true;
    const newItem: IplotScatter = {
      _id: this.plotInfo.slice(-1)[0]._id + 1,
      tag_x: this.tagList[0],
      tag_y: this.tagList[1],
      dateRange: [this.xrange[0].toISOString(), this.xrange[1].toISOString()]
    }
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

  onChangeDateTime(xrange: Moment[]) {
    this.isUnSaved = true;
    this.xrange = xrange;
    this.placeholder = this.p_lib.getTimePlaceholderValue(this.xrange, MOMENT_FORMATS);
    this.plotInfo = this.plotInfo.map(itm => {
      itm.dateRange = [xrange[0].toISOString(), xrange[1].toISOString()];
      return itm
    })
    this.updateAllGraph();
  }

  changeViewMode(viewTag: boolean) {
    this.plotInfo.forEach(pInfo => {
      const xtitle = viewTag? pInfo.tag_x: this.tagInfo?.items.find(info => info.tag === pInfo.tag_x)?.description;
      const ytitle = viewTag? pInfo.tag_y: this.tagInfo?.items.find(info => info.tag === pInfo.tag_y)?.description;
      pInfo.layout = this.setLayout(pInfo, xtitle!, ytitle!);
      pInfo.datasets = pInfo.datasets;
    })
  }

  plotSettingModal(idx: number) {
    this.modal.scatterSettingModal(this.plotInfo[idx], this.tagList, this.yrangeList).then(res => {
      this.isUnSaved = true;
      this.plotInfo[idx] = res;
      this.updateSingleGraph(this.plotInfo[idx]);
    }, (err) => {});
  }

  save() {
    forkJoin(
      [
        this.mongo.deleteScatterInfo(this.deleteBuffer),
        this.mongo.updateScatterInfo(this.plotInfo)
      ]
    ).subscribe( _ => {
      this.isUnSaved = false;
      this.modal.message('Saved', 'This dashboard was saved successfully.').then().catch();
    }, (err) => {
      this.modal.message('Error', 'Save Failed. Something is wrong.').then().catch();
    })
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event) {
    if (this.isUnSaved) { e.returnValue = true; }
  }

}
