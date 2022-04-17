import { Component, OnInit, HostListener } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService, IdefaultYranges } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { faTrashAlt, faPen, faClock, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { Observable, forkJoin } from 'rxjs';
import { Moment } from 'moment';
import * as moment from 'moment';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';
import { ItagInfo } from '../data-description/data-description.component';

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

// see:https://danielykpan.github.io/date-time-picker/#Use%20picker%20with%20MomentJS
export const MOMENT_FORMATS = {
  parseInput: 'l LT',
  full: 'YYYY/MM/DD HH:mm',
  datePickerInput: 'l',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css'],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MOMENT_FORMATS }
  ]
})
export class VisualizerComponent implements OnInit {

  deleteIcon = faTrashAlt;
  editIcon = faPen;
  clockIcon = faClock;
  viewModeIcon = faExchangeAlt;

  isUnSaved = false;
  fontColor = '#C9CDCE';

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

  tagList: string[] = [];
  yrangeList: IdefaultYranges = {};
  plotInfo: IplotMulti[] = [];
  deleteBuffer: IplotMulti[] = [];
  measurement: string = 'rawdata';
  defaultXrange: Moment[] = [];
  xrange: Moment[] = [];
  placeholder: string = '';
  tagInfo?: ItagInfo;
  viewTag: boolean = true;

  constructor(
    private influx: InfluxService,
    private mongo: MongoService,
    private modal: ModalService) { }

  updateAllGraph(): void {
    this.plotInfo.forEach(graphInfo => {
      const tagList = graphInfo.items.map(itm => itm.tag);
      this.setDataset(graphInfo, tagList);
    })
  }

  updateSingleGraph(graphIdx: number): void {
    const tagList = this.plotInfo[graphIdx].items.map(itm => itm.tag);
    this.setDataset(this.plotInfo[graphIdx], tagList);
  }

  setDataset(graphInfo: IplotMulti, tagList: string[]) {
    let From: string;
    let To: string;

    if (graphInfo.dateRange?.length !== 2) {
      From = this.defaultXrange[0].toISOString();
      To = this.defaultXrange[1].toISOString();
    } else {
      From = graphInfo.dateRange[0];
      To = graphInfo.dateRange[1];
    }

    graphInfo.layout = this.setLayout(graphInfo);

    graphInfo.datasets! = [];
    this.influx.getHistoricalData(tagList, this.measurement, From, To).subscribe(res => {
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
    const layout: Partial<Plotly.Layout>  = {
      margin: { l: 50, r: 50, b: 35, t: 0 },
      paper_bgcolor: 'rgb(24, 27, 31)',
      plot_bgcolor: 'rgb(24, 27, 31)',
      height: 200,
      showlegend: true,
      legend: {
        y: 1.4,
        xanchor: 'center',
        x: 0.5,
        orientation: 'h',
        font: {
          color: this.fontColor
        }
      },
      xaxis: {
        domain: [0.08, 0.92],
        showgrid: true,
        color: this.fontColor,
      },
      yaxis: {
        color: this.colors[0],
        autorange: false,
        zeroline: false,
        title: {
          text: '',
          standoff: 5
        },
      },
      yaxis2: {
        overlaying: 'y',
        side: 'right',
        showgrid: false,
        color: this.colors[1],
        autorange: false,
        zeroline: false,
        title: {
          text: '',
          standoff: 5
        },
      },
      yaxis3: {
        overlaying: 'y',
        side: 'left',
        showgrid: false,
        position: 0.04,
        color: this.colors[2],
        autorange: false,
        zeroline: false,
        title: {
          text: '',
          standoff: 5
        },
      },
      yaxis4: {
        overlaying: 'y',
        side: 'right',
        showgrid: false,
        position: 0.96,
        color: this.colors[3],
        autorange: false,
        zeroline: false,
        title: {
          text: '',
          standoff: 5
        },
      },
      yaxis5: {
        overlaying: 'y',
        side: 'left',
        showgrid: false,
        position: 0,
        color: this.colors[4],
        autorange: false,
        zeroline: false,
        title: {
          text: '',
          standoff: 5
        },
      },
      yaxis6: {
        overlaying: 'y',
        side: 'right',
        showgrid: false,
        position: 1,
        color: this.colors[5],
        autorange: false,
        zeroline: false,
        title: {
          text: '',
          standoff: 5
        },
      },
    }

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
        default:
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
    this.tagList = await this.influx.getTagList().toPromise() as string[];
    this.yrangeList = await this.influx.getDefaultYrangeList(this.tagList).toPromise() as IdefaultYranges;
    const latestTimeStamp = await this.influx.getLatestTimeStamp().toPromise() as string;
    this.defaultXrange = [moment(latestTimeStamp).subtract(1, 'd'), moment(latestTimeStamp)]
    this.tagInfo = await this.mongo.getTagInfo().toPromise() as ItagInfo;
    this.plotInfo = await this.mongo.getTSmultiInfoAll().toPromise() as IplotMulti[];
    this.xrange = this.plotInfo[0].dateRange? this.plotInfo[0].dateRange.map(itm => moment(itm)): []
    this.placeholder = this.getTimePlaceholderValue();
  }

  patchPlotInfo(plotInfo: IplotMulti[]): Observable<void> {
    return this.mongo.updateTSmultiInfo(plotInfo);
  }

  deletePlotInfo(plotInfo: IplotMulti[]): Observable<void> {
    return this.mongo.deleteTSmultiInfo(plotInfo);
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
    this.updateSingleGraph(this.plotInfo.length - 1);
  }

  plotSettingModal(idx: number) {
    this.modal.plotSettingModal(this.plotInfo[idx], this.tagList, this.yrangeList).then(res => {
      this.isUnSaved = true;
      this.plotInfo[idx] = res;
      this.updateSingleGraph(idx);
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
        this.deletePlotInfo(this.deleteBuffer),
        this.patchPlotInfo(this.plotInfo)
      ]
    ).subscribe(_ => {
      alert('Saved Successfully!');
      this.isUnSaved = false;
    }, (err) => {
      alert(err);
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
    let ret = this.xrange[0]? moment(this.xrange[0]).format(MOMENT_FORMATS.full): this.defaultXrange[0].format(MOMENT_FORMATS.full);
    ret += ' ~ ';
    ret += this.xrange[1]? moment(this.xrange[1]).format(MOMENT_FORMATS.full): this.defaultXrange[1].format(MOMENT_FORMATS.full);
    return ret;
  }

  changeViewMode() {
    this.viewTag = !this.viewTag;
    this.plotInfo.forEach(pInfo => {
      pInfo.items.forEach((itm, idx) => {
        if (this.viewTag) {
          pInfo.datasets![idx].name = itm.tag;
        } else {
          pInfo.datasets![idx].name = this.tagInfo?.items.find(info => info.tag === itm.tag)?.description;
        }
      })
    })
  }

  shouldConfirmOnBeforeunload() {
    return this.isUnSaved;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event) {
    if (this.shouldConfirmOnBeforeunload()) {
      e.returnValue = true;
    }
  }
}
