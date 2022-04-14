import { Component, OnInit, Input } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService, IdefaultYranges } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { faCirclePlus, faTrash, faCog } from '@fortawesome/free-solid-svg-icons';
import { Moment } from 'moment';

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
  datasets?: Partial<Plotly.PlotData>[]
}

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css']
})
export class VisualizerComponent implements OnInit {

  plusIcon = faCirclePlus;
  deleteIcon = faTrash;
  settingIcon = faCog;

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

  layout: Partial<Plotly.Layout> =  {
    margin: { l: 50, r: 50, b: 35, t: 0 },
    height: 210,
    showlegend: true,
    legend: {
      yanchor: 'top',
      y: 1.4,
      xanchor: 'center',
      x: 0.5,
      orientation: 'h',
    },
    xaxis: {
      domain: [0.08, 0.92],
      showgrid: false,
      linewidth: 1,
    },
    yaxis: {
      linewidth: 2,
      gridwidth: 1,
      color: this.colors[0],
      autorange: false,
      zeroline: false,
    },
    yaxis2: {
      linewidth: 2,
      overlaying: 'y',
      side: 'right',
      showgrid: false,
      color: this.colors[1],
      autorange: false,
      zeroline: false,
    },
    yaxis3: {
      linewidth: 2,
      overlaying: 'y',
      side: 'left',
      showgrid: false,
      position: 0.04,
      color: this.colors[2],
      autorange: false,
      zeroline: false,
    },
    yaxis4: {
      linewidth: 2,
      overlaying: 'y',
      side: 'right',
      showgrid: false,
      position: 0.96,
      color: this.colors[3],
      autorange: false,
      zeroline: false,
    },
    yaxis5: {
      linewidth: 2,
      overlaying: 'y',
      side: 'left',
      showgrid: false,
      position: 0,
      color: this.colors[4],
      autorange: false,
      zeroline: false,
    },
    yaxis6: {
      linewidth: 2,
      overlaying: 'y',
      side: 'right',
      showgrid: false,
      position: 1,
      color: this.colors[5],
      autorange: false,
      zeroline: false,
    },
  }

  tagList: string[] = [];
  yrangeList: IdefaultYranges = {};
  plotInfo: IplotMulti[] = [];
  xrange: string[] = [];
  measurement: string = 'rawdata';

  @Input() 
  set plotDateRange(data: string[]) {
    this.xrange = data;
    this.plotInfo = this.plotInfo.map(itm => {
      itm.dateRange = data;
      return itm
    })

    this.patchAllPlotInfo(this.plotInfo);
  }

  constructor(
    private influx: InfluxService,
    private mongo: MongoService,
    private modal: ModalService) { }

  updateAllGraph(): void {
    this.mongo.getTSmultiInfoAll().subscribe(res => {
      this.plotInfo = res;
      this.plotInfo.forEach(graphInfo => {
        const tagList = graphInfo.items.map(itm => itm.tag);
        this.setDataset(graphInfo, tagList);
      })
    })
  }

  updateSingleGraph(graphIdx: number): void {
    this.mongo.getTSmultiInfo(this.plotInfo[graphIdx]._id).subscribe(res => {
      this.plotInfo[graphIdx] = res;
      const tagList = res.items.map(itm => itm.tag);
      this.setDataset(this.plotInfo[graphIdx], tagList);
    })
  }

  setDataset(graphInfo: IplotMulti, tagList: string[]) {
    const From = graphInfo.dateRange? graphInfo.dateRange[0]: undefined;
    const To = graphInfo.dateRange? graphInfo.dateRange[1]: undefined;

    this.influx.getHistoricalData(tagList, this.measurement, From, To).subscribe(res => {
      graphInfo.items.forEach((item, idx) => {

        graphInfo.datasets!.push(
          {
            x: res[item.tag].map(itm => itm.timeStamp),
            y: res[item.tag].map(itm => itm.value),
            name: item.tag,
            yaxis: `y${idx+1}`,
          }
        )

        if (!item.yrange) {
          item.yrange = {
            min: Math.min(...res[item.tag].map(itm => itm.value)),
            max: Math.max(...res[item.tag].map(itm => itm.value))
          }
        }
        this.setYrange(idx, item.yrange!);
      })
    })
  }

  setYrange(graphIdx: number, yrange: {min: number, max: number}) {
    switch (graphIdx) {
      case 0:
        this.layout.yaxis!.range = [yrange.min, yrange.max];
        break;
      case 1:
        this.layout.yaxis2!.range = [yrange.min, yrange.max];
        break;
      case 2:
        this.layout.yaxis3!.range = [yrange.min, yrange.max];
        break;
      case 3:
        this.layout.yaxis4!.range = [yrange.min, yrange.max];
        break;
      case 4:
        this.layout.yaxis5!.range = [yrange.min, yrange.max];
        break;
      case 5:
        this.layout.yaxis6!.range = [yrange.min, yrange.max];
        break;
      default:
        break;
    }
  }

  ngOnInit(): void {
    this.influx.getTagList().subscribe(res => {
      this.tagList = res

      this.influx.getDefaultYrangeList(this.tagList).subscribe(res => {
        this.yrangeList = res;
      })
    })

    this.updateAllGraph();
  }

  patchPlotInfo(plotInfo: IplotMulti[], idx: number) {
    this.mongo.updateTSmultiInfo(plotInfo).subscribe(_ => {
      this.updateSingleGraph(idx);
    });
  }

  patchAllPlotInfo(plotInfo: IplotMulti[]) {
    this.mongo.updateTSmultiInfo(plotInfo).subscribe(_ => {
      this.updateAllGraph();
    })
  }

  addGraph() {
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
      ]
    }
    this.plotInfo.push(newItem);
    this.patchPlotInfo([newItem], this.plotInfo.length - 1);
  }

  plotSettingModal(idx: number) {
    this.modal.plotSettingModal(this.plotInfo[idx], this.tagList, this.yrangeList).then(res => {
      this.patchPlotInfo([res], idx);
    });
  }

  deleteGraph(idx: number) {
    // show confirm message before deleting graph.
    if (confirm('Are you sure to delete?')) {
      this.mongo.deleteTSmultiInfo(this.plotInfo[idx]._id).subscribe(_ => {
        this.updateAllGraph();
      });
    }
  }
}
