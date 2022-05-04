import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-analyze',
  templateUrl: './data-analyze.component.html',
  styleUrls: ['./data-analyze.component.css'],
})
export class DataAnalyzeComponent implements OnInit {
  tabs = ['Summay', 'Correlation'];
  active_tab: string = this.tabs[0];

  constructor() {}

  ngOnInit(): void {}

  changeTab(tab: any) {
    this.active_tab = tab;
  }
}
