import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { faCirclePlus, faTrash, faCog } from '@fortawesome/free-solid-svg-icons';

export interface Igraph {
  _id: number,
  tagList: string[],
  yrange: [number, number][],
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
    },
    yaxis2: {
      linewidth: 2,
      overlaying: 'y',
      side: 'right',
      showgrid: false,
      color: this.colors[1],
      autorange: false,
    },
    yaxis3: {
      linewidth: 2,
      overlaying: 'y',
      side: 'left',
      showgrid: false,
      position: 0.04,
      color: this.colors[2],
      autorange: false,
    },
    yaxis4: {
      linewidth: 2,
      overlaying: 'y',
      side: 'right',
      showgrid: false,
      position: 0.96,
      color: this.colors[3],
      autorange: false,
    },
    yaxis5: {
      linewidth: 2,
      overlaying: 'y',
      side: 'left',
      showgrid: false,
      position: 0,
      color: this.colors[4],
      autorange: false,
    },
    yaxis6: {
      linewidth: 2,
      overlaying: 'y',
      side: 'right',
      showgrid: false,
      position: 1,
      color: this.colors[5],
      autorange: false,
    },
  }

  datasets: Partial<Plotly.PlotData>[][] = [[]]
  tagList: string[] = [];
  plotInfo: Igraph[] = []

  constructor(
    private influx: InfluxService,
    private mongo: MongoService,
    private modal: ModalService) { }

  updateAllGraph(): void {
    this.datasets = [];

    this.plotInfo.forEach((graphInfo, graphIdx) => {
      this.datasets.push([])

      this.influx.getHistoricalData(graphInfo.tagList).subscribe(res => {
        graphInfo.tagList.forEach((tag, idx) => {
          const x = res[tag].map(itm => itm.timeStamp);
          const y = res[tag].map(itm => itm.value);

          this.datasets[graphIdx].push(
            {
              x: x,
              y: y,
              name: tag,
              mode: 'lines',
              yaxis: `y${idx+1}`,
            }
          )

          if (!graphInfo.yrange[idx]) {
            graphInfo.yrange.push([Math.min(...y), Math.max(...y)]);
          }

          this.setYrange(idx, graphInfo.yrange[idx]);

        })
      })
    })
  }

  setYrange(graphIdx: number, yrange: [number, number]) {
    switch (graphIdx) {
      case 0:
        this.layout.yaxis!.range = yrange;
        return
      case 1:
        this.layout.yaxis2!.range = yrange;
        return
      case 2:
        this.layout.yaxis3!.range = yrange;
        return
      case 3:
        this.layout.yaxis4!.range = yrange;
        return
      case 4:
        this.layout.yaxis5!.range = yrange;
        return
      case 5:
        this.layout.yaxis6!.range = yrange;
        return
    }
  }

  ngOnInit(): void {

    this.influx.getTagList().subscribe(res => {
      this.tagList = res
    })

    this.mongo.getPlotInfoAll().subscribe(res => {
      this.plotInfo = res;
      this.updateAllGraph();
    })
  }

  patchPlotInfo(plotInfo: Igraph) {
    this.mongo.updatePlotInfo(plotInfo).subscribe(_ => {
      this.updateAllGraph();
    });
  }

  addGraph() {

  }

  plotSettingModal(idx: number) {
    this.modal.plotSettingModal(this.plotInfo[idx], this.tagList).then(res => {
      this.plotInfo[idx].tagList = res.tagList;
      this.plotInfo[idx].yrange = res.yrange;
      this.patchPlotInfo(this.plotInfo[idx]);
    });
  }
}
