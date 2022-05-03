import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { InfluxService } from '../service/influx.service';
import { plotlylib } from '../library/plotly';

@Component({
  selector: 'app-correlation-coefficient-matrix',
  templateUrl: './correlation-coefficient-matrix.component.html',
  styleUrls: ['./correlation-coefficient-matrix.component.css'],
})
export class CorrelationCoefficientMatrixComponent implements OnInit {
  p_lib = new plotlylib();
  datasets: Partial<Plotly.PlotData>[] = [];
  layout: Partial<Plotly.Layout> = {};

  constructor(private influx: InfluxService) {}

  ngOnInit(): void {
    this.updateMatrix();
  }

  updateMatrix() {
    this.influx.getCorrelationCoefficientMatrix().subscribe((res) => {
      this.datasets = [
        {
          z: res.matrix,
          x: res.x,
          y: res.y,
          type: 'heatmap',
        },
      ];

      this.layout = this.p_lib.getMatrixLayout();
    });
  }
}
