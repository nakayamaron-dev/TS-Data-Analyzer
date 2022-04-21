import { Component, OnInit, HostListener } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService, IdefaultYranges } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { faTrashAlt, faPen, faClock, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { forkJoin } from 'rxjs';
import { Moment } from 'moment';
import * as moment from 'moment';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';
import { ItagInfo } from '../data-description/data-description.component';
import { plotlylib } from '../library/plotly';

export interface IplotMulti {
  _id: number,
  dateRange?: string[],
  items: {
    tag: string,
    yrange?: {
        min: number,
        max: number
    }
  }[],
  datasets?: Partial<Plotly.PlotData>[],
  layout?: Partial<Plotly.Layout>
}

export const MOMENT_FORMATS = 'YYYY/MM/DD HH:mm';

@Component({
  selector: 'app-tsmulti',
  templateUrl: './tsmulti.component.html',
  styleUrls: ['./tsmulti.component.css'],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MOMENT_FORMATS }
  ]
})
export class TsMultiComponent implements OnInit {
  deleteIcon = faTrashAlt;
  editIcon = faPen;
  clockIcon = faClock;
  viewModeIcon = faExchangeAlt;
  isUnSaved = false;

  p_lib = new plotlylib();
  tagList: string[] = [];
  yrangeList: IdefaultYranges = {};
  plotInfo: IplotMulti[] = [];
  deleteBuffer: IplotMulti[] = [];
  defaultXrange: Moment[] = [];
  xrange: Moment[] = [];
  placeholder: string = '';
  tagInfo?: ItagInfo;
  viewTag: boolean = true;

  constructor(private influx: InfluxService, private mongo: MongoService, private modal: ModalService) {}

  updateAllGraph(): void {
    this.plotInfo.forEach(graphInfo => {
      this.updateSingleGraph(graphInfo);
    })
  }

  updateSingleGraph(graphInfo: IplotMulti) {
    const tagList = graphInfo.items.map(itm => itm.tag);
    const From = graphInfo.dateRange?.length === 2? graphInfo.dateRange[0]: this.defaultXrange[0].toISOString();
    const To = graphInfo.dateRange?.length === 2? graphInfo.dateRange[1]: this.defaultXrange[1].toISOString();
    graphInfo.layout = this.setLayout(graphInfo);
    graphInfo.datasets = [];

    this.influx.getHistoricalData(tagList, From, To).subscribe(res => {
      graphInfo.items.forEach((item, idx) => {
        const x = res[item.tag]? res[item.tag].map(itm => itm.timeStamp): [];
        const y = res[item.tag]? res[item.tag].map(itm => itm.value): [];

        graphInfo.datasets!.push(
          {
            x: x,
            y: y,
            name: item.tag,
            yaxis: `y${idx+1}`,
          }
        )

        if (!item.yrange) {
          item.yrange = {
            min: Math.min(...y),
            max: Math.max(...y)
          }
        }
      })
    })
  }

  setLayout(graphInfo: IplotMulti) {
    const layout: Partial<Plotly.Layout>  = this.p_lib.getTsMultiLayout();

    graphInfo.items.forEach((itm, idx) => {
      const unit = this.tagInfo?.items.find(a => a.tag === itm.tag)?.unit;
      switch (idx) {
        case 0:
          (layout.yaxis!.title as Partial<Plotly.DataTitle>).text = unit;
          layout.yaxis!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 1:
          (layout.yaxis2!.title as Partial<Plotly.DataTitle>).text = unit;
          layout.yaxis2!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 2:
          (layout.yaxis3!.title as Partial<Plotly.DataTitle>).text = unit;
          layout.yaxis3!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 3:
          (layout.yaxis4!.title as Partial<Plotly.DataTitle>).text = unit;
          layout.yaxis4!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 4:
          (layout.yaxis5!.title as Partial<Plotly.DataTitle>).text = unit;
          layout.yaxis5!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
        case 5:
          (layout.yaxis6!.title as Partial<Plotly.DataTitle>).text = unit;
          layout.yaxis6!.range = [itm.yrange!.min, itm.yrange!.max];
          break;
      }
    })
    return layout;
  }

  async ngOnInit() {
    await this.setBaseData();
    this.updateAllGraph();
  }

  async setBaseData() {
    this.tagInfo = await this.mongo.getTagInfo().toPromise() as ItagInfo;
    this.tagList = this.tagInfo.items.map(itm => itm.tag);
    this.yrangeList = await this.influx.getDefaultYrangeList(this.tagList).toPromise() as IdefaultYranges;
    const latestTimeStamp = await this.influx.getLatestTimeStamp().toPromise() as string;
    this.defaultXrange = [moment(latestTimeStamp).subtract(1, 'd'), moment(latestTimeStamp)]
    this.plotInfo = await this.mongo.getTSmultiInfoAll().toPromise() as IplotMulti[];
    this.xrange = this.plotInfo[0].dateRange? this.plotInfo[0].dateRange.map(itm => moment(itm)): []
    this.placeholder = this.p_lib.getTimePlaceholderValue(this.xrange, MOMENT_FORMATS);
  }

  addGraph() {
    this.isUnSaved = true;
    const newItem: IplotMulti = {
      _id: this.plotInfo.slice(-1)[0]._id + 1,
      items: [
          {
              tag: this.tagList[0],
              yrange: {
                min: this.yrangeList[this.tagList[0]].min,
                max: this.yrangeList[this.tagList[0]].max
              }
          }
      ],
      dateRange: [this.xrange[0].toISOString(), this.xrange[1].toISOString()]
    }
    this.plotInfo.push(newItem);
    this.updateSingleGraph(newItem);
  }

  plotSettingModal(idx: number) {
    this.modal.plotSettingModal(this.plotInfo[idx], this.tagList, this.yrangeList).then(res => {
      this.isUnSaved = true;
      this.plotInfo[idx] = res;
      this.updateSingleGraph(this.plotInfo[idx]);
    }, (err) => {});
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
    forkJoin(
      [
        this.mongo.deleteTSmultiInfo(this.deleteBuffer),
        this.mongo.updateTSmultiInfo(this.plotInfo)
      ]
    ).subscribe( _ => {
      this.isUnSaved = false;
      alert('Saved Successfully!');
    }, (err) => {
      alert(err);
    })
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
      pInfo.items.forEach((itm, idx) => {
        pInfo.datasets![idx].name = viewTag? itm.tag: this.tagInfo?.items.find(info => info.tag === itm.tag)?.description;
      })
    })
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event) {
    if (this.isUnSaved) { e.returnValue = true; }
  }
}
