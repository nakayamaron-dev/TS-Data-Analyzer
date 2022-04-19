import { Component, OnInit, HostListener } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { faTrashAlt, faPen, faClock, faExchangeAlt, IconPack } from '@fortawesome/free-solid-svg-icons';
import { forkJoin } from 'rxjs';
import { Moment } from 'moment';
import * as moment from 'moment';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';
import { ItagInfo } from '../data-description/data-description.component';

export interface IplotHist {
  _id: number,
  dateRange?: string[],
  plotTag: string[],
  datasets?: Partial<Plotly.PlotData>[],
  layout?: Partial<Plotly.Layout>
}

export const MOMENT_FORMATS = 'YYYY/MM/DD HH:mm';

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css'],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MOMENT_FORMATS }
  ]
})
export class HistogramComponent implements OnInit {

  deleteIcon = faTrashAlt;
  editIcon = faPen;
  clockIcon = faClock;
  viewModeIcon = faExchangeAlt;

  colors: string[] = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
  ]

  config: Partial<Plotly.Config> = {
    displaylogo: false,
    displayModeBar: false,
  }

  isUnSaved = false;
  fontColor = '#C9CDCE';
  tagList: string[] = [];
  plotInfo: IplotHist[] = [];
  deleteBuffer: IplotHist[] = [];
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
    this.tagList = await this.influx.getTagList().toPromise() as string[];
    this.tagInfo = await this.mongo.getTagInfo().toPromise() as ItagInfo;
    this.plotInfo = await this.mongo.getHistogramInfo().toPromise() as IplotHist[];
    const latestTimeStamp = await this.influx.getLatestTimeStamp().toPromise() as string;
    this.defaultXrange = [moment(latestTimeStamp).subtract(1, 'd'), moment(latestTimeStamp)];
    this.xrange = this.plotInfo[0].dateRange?.length === 2? this.plotInfo[0].dateRange.map(itm => moment(itm)): this.defaultXrange;
    this.placeholder = this.getTimePlaceholderValue();
  }

  updateAllGraph(): void {
    this.plotInfo.forEach(graphInfo => {
      this.updateSingleGraph(graphInfo);
    })
  }

  updateSingleGraph(graphInfo: IplotHist) {
    const From = graphInfo.dateRange?.length === 2? graphInfo.dateRange[0]: this.defaultXrange[0].toISOString();
    const To = graphInfo.dateRange?.length === 2? graphInfo.dateRange[1]: this.defaultXrange[1].toISOString();
    graphInfo.layout = this.setLayout();
    graphInfo.datasets = [];

    this.influx.getHistoricalData(graphInfo.plotTag, From, To).subscribe(res => {
      graphInfo.plotTag.forEach((tag, idx) => {
        const x = res[tag]? res[tag].map(itm => itm.value): [];

        graphInfo.datasets!.push(
          {
            x: x,
            name: tag,
            type: 'histogram',
            xaxis: `x${idx+1}`,
            opacity: 0.3,
            marker: {
              color: 'yellowgreen',
           },
          }
        )
      })
    })
  }

  setLayout() {
    const layout: Partial<Plotly.Layout> = {
      margin: { l: 30, r: 30, b: 25, t: 0 },
      paper_bgcolor: 'rgb(24, 27, 31)',
      plot_bgcolor: 'rgb(24, 27, 31)',
      height: 220,
      showlegend: true,
      barmode: "overlay",
      legend: {
        y: 1.2,
        xanchor: 'center',
        x: 0.5,
        orientation: 'h',
        font: { color: this.fontColor }
      },
      xaxis: { showgrid: true },
    }
    return layout;
  }

  plotSettingModal(idx: number) {

  }

  save() {
    forkJoin(
      [
        this.mongo.deleteHistogramInfo(this.deleteBuffer),
        this.mongo.updateHistogramInfo(this.plotInfo)
      ]
    ).subscribe( _ => {
      alert('Saved Successfully!');
      this.isUnSaved = false;
    }, (err) => {
      alert(err);
    })
  }

  changeViewMode() {
    this.viewTag = !this.viewTag;
    this.plotInfo.forEach(pInfo => {
      pInfo.plotTag.forEach((tag, idx) => {
        pInfo.datasets![idx].name = this.viewTag? tag: this.tagInfo?.items.find(info => info.tag === tag)?.description;
      })
    })
  }

  onChangeDateTime() {
    this.isUnSaved = true;
    this.plotInfo = this.plotInfo.map(itm => {
      itm.dateRange = [this.xrange[0].toISOString(), this.xrange[1].toISOString()];
      return itm
    })
    this.placeholder = this.getTimePlaceholderValue();
    this.updateAllGraph();
  }

  getTimePlaceholderValue(): string {
    let ret = this.xrange[0]? moment(this.xrange[0]).format(MOMENT_FORMATS): this.defaultXrange[0].format(MOMENT_FORMATS);
    ret += ' ~ ';
    ret += this.xrange[1]? moment(this.xrange[1]).format(MOMENT_FORMATS): this.defaultXrange[1].format(MOMENT_FORMATS);
    return ret;
  }

  addGraph() {
    this.isUnSaved = true;
    const newItem: IplotHist = {
      _id: this.plotInfo.slice(-1)[0]._id + 1,
      plotTag: [this.tagList[0]],
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

  onSelectedTags(val: any) {
    console.log(val);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event) {
    if (this.isUnSaved) { e.returnValue = true; }
  }
}
