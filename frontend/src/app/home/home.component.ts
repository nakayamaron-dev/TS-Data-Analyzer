import { Component, OnInit } from '@angular/core';

export interface menus {
  icon: string;
  description: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  menulist: menus[] = [
    {
      icon: 'grid_view',
      description:
        'Visualize time series data. For example, line graphs, histograms, scatter plots, etc. can be displayed.',
    },
    {
      icon: 'psychology',
      description:
        'Analyze time series data. Aggregate values by Tag and correlation coefficient matrices can be viewed.',
    },
    {
      icon: 'description',
      description:
        'For each Tag, you can associate a recognizable description with the unit.',
    },
    {
      icon: 'settings',
      description: 'Various settings can be changed. You can also upload data.',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
