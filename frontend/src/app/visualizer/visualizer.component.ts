import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService } from '../service/influx.service';

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

  data: Partial<Plotly.PlotData>[] = [
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
  ]

  tagList: string[] = [];

  constructor(private influx: InfluxService) { }

  async updateData(tagList: string[]): Promise<void> {
    const res = await this.influx.getHistoricalData(tagList).toPromise();

    if (res) {
      tagList.forEach(tag => {
        this.data[0].x = res[tag].map(itm => itm.timeStamp)
        this.data[0].y = res[tag].map(itm => itm.value)
        this.data[1].y = res[tag].map(itm => itm.value)
      })
    }
  }

  onSelectPlotTag(tag: string) {
    this.updateData([tag]);
  }

  ngOnInit(): void {

    this.influx.getTagList().subscribe(res => {
      this.tagList = res
    })

    this.updateData([])
  }

}
