import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { faAdd } from '@fortawesome/free-solid-svg-icons';

interface Igraph {
  tagList: string[]
}

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css']
})
export class VisualizerComponent implements OnInit {

  plusIcon = faAdd;

  config: Partial<Plotly.Config> = {
    displaylogo: false,
    displayModeBar: false,
    modeBarButtonsToRemove: ['sendDataToCloud'],
  }

  layout: Partial<Plotly.Layout> =  {
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

  async updateData(): Promise<void> {
    this.datasets = [[]]

    this.plotInfo.forEach((graphInfo, graphIdx) => {

      this.influx.getHistoricalData(graphInfo.tagList).subscribe(res => {
        graphInfo.tagList.forEach((tag, idx) => {
          const x = res[tag].map(itm => itm.timeStamp);
          const y = res[tag].map(itm => itm.value);

          this.datasets[graphIdx].push(
            {
              x: x,
              y: y,
              name: tag,
              mode: 'lines+markers',
              marker: { size: 1 },
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
    this.mongo.updatePlotInfo(this.plotInfo).subscribe(_ => {
      this.updateData();
    });
  }

  ngOnInit(): void {

    this.influx.getTagList().subscribe(res => {
      this.tagList = res
    })

    this.mongo.getPlotInfo().subscribe(res => {
      this.plotInfo = res;
      this.updateData();
    })
  }

}
