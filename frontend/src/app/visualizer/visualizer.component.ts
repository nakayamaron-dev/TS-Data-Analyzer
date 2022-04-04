import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';

interface Igraph {
  tagList: string[]
}

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css']
})
export class VisualizerComponent implements OnInit {

  config: Partial<Plotly.Config> = {
    displaylogo: false,
    displayModeBar: false,
    modeBarButtonsToRemove: ['sendDataToCloud'],
  }

  layout: Partial<Plotly.Layout> =  {
    xaxis: {
      domain: [0, 0.85],
      showgrid: false,
      linewidth: 1,
    },
    yaxis: {
      linewidth: 1,
      gridwidth: 1,
    },
    xaxis2: {
      domain: [0.86, 1],
      linewidth: 1,
      showgrid: false,
    }
  }

  datasets: Partial<Plotly.PlotData>[][] = []
  tagList: string[] = [];

  constructor(private influx: InfluxService, private mongo: MongoService) { }

  async updateData2(config: Igraph[]): Promise<void> {
    this.datasets = []

    config.forEach((graphInfo, index) => {

      this.datasets.push([
        {
          x: [],
          y: [],
          mode: 'lines+markers',
          marker: { size: 1 },
          showlegend: false,
        },
        {
          y: [],
          type: 'histogram',
          xaxis: 'x2',
          showlegend: false,
        }
      ]);

      this.influx.getHistoricalData(graphInfo.tagList).subscribe(res => {

        if (res) {
          graphInfo.tagList.forEach(tag => {
            this.datasets[index][0].x = res[tag].map(itm => itm.timeStamp)
            this.datasets[index][0].y = res[tag].map(itm => itm.value)
            this.datasets[index][1].y = res[tag].map(itm => itm.value)
          })
        }
      })
    })
  }

  onSelectPlotTag(tag: string) {
    // this.updateData([tag]);
  }

  ngOnInit(): void {

    this.influx.getTagList().subscribe(res => {
      this.tagList = res
    })

    this.mongo.getPlotInfo().subscribe(res => {
      this.updateData2(res);
    })
  }

}
