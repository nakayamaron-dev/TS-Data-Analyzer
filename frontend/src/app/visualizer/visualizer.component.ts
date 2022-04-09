import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';
import { faCirclePlus, faTrash, faCog } from '@fortawesome/free-solid-svg-icons';

export interface Igraph {
  _id: number,
  tagList: string[]
}

export interface Imodal {
  setting: Igraph,
  tagListAll: string[]
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
      showgrid: false,
      linewidth: 1,
    },
    yaxis: {
      linewidth: 1,
      gridwidth: 1,
      zeroline: false,
    },
    yaxis2: {
      overlaying: 'y',
      side: 'right',
      showgrid: false,
      zeroline: false,
    }
  }

  datasets: Partial<Plotly.PlotData>[][] = [[]]
  tagList: string[] = [];
  plotInfo: Igraph[] = []

  constructor(private influx: InfluxService, private mongo: MongoService, private modal: ModalService) { }

  updateAllGraph(): void {
    this.datasets = [];

    this.plotInfo.forEach((graphInfo, graphIdx) => {
      this.datasets.push([])

      this.influx.getHistoricalData(graphInfo.tagList).subscribe(res => {
        graphInfo.tagList.forEach((tag, idx) => {
          this.datasets[graphIdx].push(
            {
              x: res[tag].map(itm => itm.timeStamp),
              y: res[tag].map(itm => itm.value),
              name: tag,
              mode: 'lines',
              yaxis: `y${idx+1}`,
            }
          )
        })
      })
    })
  }

  onSelectPlotTag(tag: string, idx1: number, idx2: number) {
    this.plotInfo[idx1].tagList[idx2] = tag;
    this.patchPlotInfo(this.plotInfo[idx1]);
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

  addTag(graphIdx: number) {
    this.plotInfo[graphIdx].tagList.push(this.tagList[0])
    this.patchPlotInfo(this.plotInfo[graphIdx]);
  }

  removeTag(graphIdx: number, tagIdx: number) {
    this.plotInfo[graphIdx].tagList.splice(tagIdx, 1);
    this.patchPlotInfo(this.plotInfo[graphIdx]);
  }

  patchPlotInfo(plotInfo: Igraph) {
    this.mongo.updatePlotInfo(plotInfo).subscribe(res => {
      this.updateAllGraph();
    });
  }

  addGraph() {

  }

  plotSettingModal(idx: number) {
    const data: Imodal = {
      setting: this.plotInfo[idx],
      tagListAll: this.tagList
    }

    this.modal.plotSettingModal(data).then(res => {
      this.plotInfo[idx].tagList = res.setting.tagList;
      this.patchPlotInfo(this.plotInfo[idx]);
    });
  }
}
