import { Moment } from 'moment';
import * as moment from 'moment';

export class plotlylib {
  private fontColor = '#C9CDCE';
  private singlePlotHeight = 135;
  private plotHeight = 205;
  private matrixHeight = 825;

  public plotColors: string[] = [
    '#1f77b4', // muted blue
    '#ff7f0e', // safety orange
    '#2ca02c', // cooked asparagus green
    '#d62728', // brick red
    '#9467bd', // muted purple5
    '#8c564b', // chestnut brown
  ];

  public config: Partial<Plotly.Config> = {
    displaylogo: false,
    displayModeBar: false,
  };

  getTSSingleLayout(): Partial<Plotly.Layout> {
    return {
      margin: { l: 50, r: 50, b: 35, t: 0 },
      paper_bgcolor: 'rgb(24, 27, 31)',
      plot_bgcolor: 'rgb(24, 27, 31)',
      height: this.singlePlotHeight,
      showlegend: true,
      legend: {
        y: 1.5,
        xanchor: 'center',
        x: 0.5,
        orientation: 'h',
        font: { color: this.fontColor },
      },
      xaxis: {
        domain: [0, 0.85],
        showgrid: true,
        color: this.fontColor,
      },
      xaxis2: {
        domain: [0.86, 1],
        color: this.fontColor,
      },
      yaxis: {
        color: this.plotColors[0],
        zeroline: false,
        showgrid: true,
        title: { text: '', standoff: 5 },
      },
      yaxis2: {
        color: this.plotColors[0],
        zeroline: false,
      },
    };
  }

  getTsMultiLayout(): Partial<Plotly.Layout> {
    return {
      margin: { l: 50, r: 50, b: 35, t: 0 },
      paper_bgcolor: 'rgb(24, 27, 31)',
      plot_bgcolor: 'rgb(24, 27, 31)',
      height: this.plotHeight,
      showlegend: true,
      legend: {
        y: 1.4,
        xanchor: 'center',
        x: 0.5,
        orientation: 'h',
        font: { color: this.fontColor },
      },
      xaxis: {
        domain: [0.08, 0.92],
        showgrid: true,
        color: this.fontColor,
      },
      yaxis: {
        color: this.plotColors[0],
        zeroline: false,
        title: { text: '', standoff: 5 },
      },
      yaxis2: {
        overlaying: 'y',
        side: 'right',
        showgrid: false,
        color: this.plotColors[1],
        zeroline: false,
        title: { text: '', standoff: 5 },
      },
      yaxis3: {
        overlaying: 'y',
        side: 'left',
        showgrid: false,
        position: 0.04,
        color: this.plotColors[2],
        zeroline: false,
        title: { text: '', standoff: 5 },
      },
      yaxis4: {
        overlaying: 'y',
        side: 'right',
        showgrid: false,
        position: 0.96,
        color: this.plotColors[3],
        zeroline: false,
        title: { text: '', standoff: 5 },
      },
      yaxis5: {
        overlaying: 'y',
        side: 'left',
        showgrid: false,
        position: 0,
        color: this.plotColors[4],
        zeroline: false,
        title: { text: '', standoff: 5 },
      },
      yaxis6: {
        overlaying: 'y',
        side: 'right',
        showgrid: false,
        position: 1,
        color: this.plotColors[5],
        zeroline: false,
        title: { text: '', standoff: 5 },
      },
    };
  }

  getHistogramLayout(): Partial<Plotly.Layout> {
    return {
      margin: { l: 30, r: 30, b: 25, t: 0 },
      paper_bgcolor: 'rgb(24, 27, 31)',
      plot_bgcolor: 'rgb(24, 27, 31)',
      height: this.plotHeight,
      showlegend: true,
      barmode: 'overlay',
      legend: {
        y: 1.2,
        xanchor: 'center',
        x: 0.5,
        orientation: 'h',
        font: { color: this.fontColor },
      },
      yaxis: {
        domain: [0.08, 1],
      },
      xaxis: {
        color: this.plotColors[0],
        showgrid: true,
      },
      xaxis2: {
        color: this.plotColors[1],
        showgrid: false,
        overlaying: 'x',
        side: 'bottom',
        position: 0,
      },
    };
  }

  getScatterLayout(): Partial<Plotly.Layout> {
    return {
      margin: { l: 50, r: 50, b: 35, t: 0 },
      paper_bgcolor: 'rgb(24, 27, 31)',
      plot_bgcolor: 'rgb(24, 27, 31)',
      height: this.plotHeight,
      xaxis: {
        showgrid: true,
        zeroline: false,
        color: this.fontColor,
        title: { text: '', standoff: 10 },
      },
      yaxis: {
        showgrid: true,
        color: this.fontColor,
        zeroline: false,
        title: { text: '', standoff: 5 },
      },
    };
  }

  getMatrixLayout(): Partial<Plotly.Layout> {
    return {
      margin: { l: 250, r: 250, b: 120, t: 50 },
      paper_bgcolor: 'rgb(24, 27, 31)',
      plot_bgcolor: 'rgb(24, 27, 31)',
      height: this.matrixHeight,
      title: 'CorrelationCoefficientMatrix',
      font: {
        color: this.fontColor,
      },
    };
  }
}
