import { Component, OnInit } from '@angular/core';
import { InfluxService, DatasetValuesSummaryInfo } from '../service/influx.service';

@Component({
  selector: 'app-dataset-summary',
  templateUrl: './dataset-summary.component.html',
  styleUrls: ['./dataset-summary.component.css']
})
export class DatasetSummaryComponent implements OnInit {

  summaryInfo?: DatasetValuesSummaryInfo;
  columns: (keyof(DatasetValuesSummaryInfo))[] = [];
  rows: string[] = [];

  constructor(private influx: InfluxService) { }

  ngOnInit(): void {
    this.influx.getDatasetSummary().subscribe(res => {
      this.summaryInfo = res;
      this.columns = Object.keys(res) as (keyof(DatasetValuesSummaryInfo))[]
      this.rows = Object.keys(res.count)
    })
  }

}
