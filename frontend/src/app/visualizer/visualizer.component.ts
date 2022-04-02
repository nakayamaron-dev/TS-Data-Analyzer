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
      showgrid: false,
      linewidth: 1,
    },
    yaxis: {
      linewidth: 1,
      gridwidth: 1,
    }
  }

  data: Partial<Plotly.PlotData>[] = [
    {
      x: [],
      y: [],
      name: "test",
      mode: 'lines+markers',
      marker: { size: 1 }
    }
  ]
  constructor(private influx: InfluxService) { }

  async updateData(): Promise<void> {
    const res = await this.influx.getHistoricalData(["Temp"]).toPromise();

    if (res) {
      this.data[0].x = res["Temp"].map(itm => itm.timeStamp)
      this.data[0].y = res["Temp"].map(itm => itm.value)
    }
  }

  ngOnInit(): void {
    this.updateData()
  }

}
