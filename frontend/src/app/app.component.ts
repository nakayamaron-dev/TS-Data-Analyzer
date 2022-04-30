import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { faCubes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  url: string = ''
  logo = faCubes;

  constructor(public router: Router,) { }

  ngOnInit() {
    this.router.events
    .pipe(
      filter(f => f instanceof NavigationEnd)
    )
    .subscribe((s: any) => {
      this.url = s.url;
    });
  }

}
