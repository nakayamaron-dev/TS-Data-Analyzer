import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService, IdefaultYranges } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { faCirclePlus, faTrash, faCog } from '@fortawesome/free-solid-svg-icons';

export interface IplotMulti {
  _id: number,
  items: [
      {
          tag: string,
          yrange?: {
              min: number,
              max: number
          }
      }
  ]
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
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf',  // blue-teal
  ]

  config: Partial<Plotly.Config> = {
    displaylogo: false,
    displayModeBar: false,
    modeBarButtonsToRemove: ['sendDataToCloud'],
  }

  layout: Partial<Plotly.Layout> =  {
    margin: { l: 60, r: 70, b: 50, t: 30 },
    height: 250,
    showlegend: true,
    legend: {
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

  datasets: Partial<Plotly.PlotData>[][] = [[]];
  tagList: string[] = [];
  yrangeList: IdefaultYranges = {};
  plotInfo: IplotMulti[] = [];

  constructor(
    private influx: InfluxService,
    private mongo: MongoService,
    private modal: ModalService) { }

  updateAllGraph(): void {
    this.datasets = [];

    this.plotInfo.forEach((graphInfo, graphIdx) => {
      this.datasets.push([])

      const tagList = graphInfo.items.map(itm => itm.tag);
      this.influx.getHistoricalData(tagList).subscribe(res => {
        graphInfo.items.forEach((item, idx) => {
          const x = res[item.tag].map(itm => itm.timeStamp);
          const y = res[item.tag].map(itm => itm.value);

          this.datasets[graphIdx].push(
            {
              x: x,
              y: y,
              name: item.tag,
              mode: 'lines',
              yaxis: `y${idx+1}`,
            }
          )

          if (!item.yrange) {
            item.yrange = {
              min: Math.min(...y),
              max: Math.max(...y)
            }
          }

          this.setYrange(idx, item.yrange!);
        })
      })
    })
  }

  updateSingleGraph(graphIdx: number): void {
    const graphInfo = this.plotInfo[graphIdx]
    const tagList = graphInfo.items.map(itm => itm.tag);

    if (this.datasets[graphIdx]) {
      this.datasets[graphIdx] = [];
    } else {
      this.datasets.push([]);
    }
    
    this.influx.getHistoricalData(tagList).subscribe(res => {
      graphInfo.items.forEach((item, idx) => {
        const x = res[item.tag].map(itm => itm.timeStamp);
        const y = res[item.tag].map(itm => itm.value);

        this.datasets[graphIdx].push(
          {
            x: x,
            y: y,
            name: item.tag,
            mode: 'lines',
            yaxis: `y${idx+1}`,
          }
        )

        if (!item.yrange) {
          item.yrange = {
            min: Math.min(...y),
            max: Math.max(...y)
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
        return
      case 1:
        this.layout.yaxis2!.range = [yrange.min, yrange.max];
        return
      case 2:
        this.layout.yaxis3!.range = [yrange.min, yrange.max];
        return
      case 3:
        this.layout.yaxis4!.range = [yrange.min, yrange.max];
        return
      case 4:
        this.layout.yaxis5!.range = [yrange.min, yrange.max];
        return
      case 5:
        this.layout.yaxis6!.range = [yrange.min, yrange.max];
        return
    }
  }

  ngOnInit(): void {

    this.influx.getTagList().subscribe(res => {
      this.tagList = res

      this.influx.getDefaultYrangeList(this.tagList).subscribe(res => {
        this.yrangeList = res;
      })
    })

    this.mongo.getTSmultiInfoAll().subscribe(res => {
      this.plotInfo = res;
      this.updateAllGraph();
    })
  }

  patchPlotInfo(plotInfo: IplotMulti) {
    this.mongo.updateTSmultiInfo(plotInfo).subscribe(_ => {
      this.updateSingleGraph(plotInfo._id);
    });
  }

  addGraph() {
    const newItem: IplotMulti = {
      _id: this.plotInfo.slice(-1)[0]._id + 1,
      items: [
          {
              tag: this.tagList[0],
          }
      ]
    }
    this.plotInfo.push(newItem);
  }

  plotSettingModal(idx: number) {
    this.modal.plotSettingModal(this.plotInfo[idx], this.tagList, this.yrangeList).then(res => {
      this.patchPlotInfo(res);
    });
  }

  deleteGraph(idx: number) {
    // TO DO: Delete item
  }
}
