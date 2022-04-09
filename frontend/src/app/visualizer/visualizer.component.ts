import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { faCirclePlus, faCircleMinus, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Igraph {
  tagList: string[]
}

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css']
})
export class VisualizerComponent implements OnInit {

  plusIcon = faCirclePlus;
  deleteIcon = faTrash;

  config: Partial<Plotly.Config> = {
    displaylogo: false,
    displayModeBar: false,
    modeBarButtonsToRemove: ['sendDataToCloud'],
  }

  layout: Partial<Plotly.Layout> =  {
    margin: { l: 60, r: 70, b: 50, t: 30 },
    height: 250,
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

  constructor(private influx: InfluxService, private mongo: MongoService) { }

  updateGraph(): void {
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
              yaxis: 'y' + (idx+1).toString(),
            }
          )

          if (idx === 0) {
            this.layout.yaxis!.range = [Math.min(...y), Math.max(...y)]
          } else if (idx === 1) {
            this.layout.yaxis2!.range = [Math.min(...y), Math.max(...y)]
          }
        })
      })
    })
  }

  onSelectPlotTag(tag: string, idx1: number, idx2: number) {
    this.plotInfo[idx1].tagList[idx2] = tag;
    this.patchPlotInfo(this.plotInfo);
  }

  ngOnInit(): void {

    this.influx.getTagList().subscribe(res => {
      this.tagList = res
    })

    this.mongo.getPlotInfo().subscribe(res => {
      this.plotInfo = res;
      this.updateGraph();
    })
  }

  addTag(graphIdx: number) {
    this.plotInfo[graphIdx].tagList.push(this.tagList[0])
    this.patchPlotInfo(this.plotInfo);
  }

  removeTag(graphIdx: number, tagIdx: number) {
    this.plotInfo[graphIdx].tagList.splice(tagIdx, 1);
    this.patchPlotInfo(this.plotInfo);
  }

  patchPlotInfo(plotInfo: Igraph[]) {
    this.mongo.updatePlotInfo(plotInfo).subscribe(_ => {
      this.updateGraph();
    });
  }

  addGraph() {
    this.plotInfo.push(
      {
        tagList: [this.tagList[0]]
      }
    )
    this.patchPlotInfo(this.plotInfo);
  }

}
