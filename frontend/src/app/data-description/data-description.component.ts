import { Component, OnInit, HostListener } from '@angular/core';
import { MongoService } from '../service/mongo.service';
import { InfluxService } from '../service/influx.service';

export interface ItagInfo {
  _id: any,
  items: {
    tag: string,
    unit: string,
    description: string
  }[]
}

@Component({
  selector: 'app-data-description',
  templateUrl: './data-description.component.html',
  styleUrls: ['./data-description.component.css']
})
export class DataDescriptionComponent implements OnInit {

  tagInfo?: ItagInfo;
  tagList: string[] = [];
  isUnSaved: boolean = false;

  constructor(private mongo: MongoService, private influx: InfluxService) { }

  ngOnInit(): void {
    this.mongo.getTagInfo().subscribe(res => {
      this.tagInfo = res;
    })
  }

  save() {
    this.mongo.updateTagInfo(this.tagInfo!).subscribe(res => {
      alert('Saved Successfully!');
      this.isUnSaved = false;
    }, (err) => {
      alert(err);
    });
  }

  onChangeTag(tag: string, idx: number) {
    this.tagInfo!.items[idx].tag = tag;
    this.isUnSaved = true;
  }


  onChangeUnit(unit: string, idx: number) {
    this.tagInfo!.items[idx].unit = unit;
    this.isUnSaved = true;
  }


  onChangeDesc(description: string, idx: number) {
    this.tagInfo!.items[idx].description = description;
    this.isUnSaved = true;
  }

  shouldConfirmOnBeforeunload() {
    return this.isUnSaved;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(e: Event) {
    if (this.shouldConfirmOnBeforeunload()) {
      e.returnValue = true;
    }
  }

}
