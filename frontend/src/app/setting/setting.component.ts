import { Component, OnInit } from '@angular/core';
import { concatMap } from 'rxjs';
import { ExcelParser } from '../service/excel-parser';
import { InfluxService } from '../service/influx.service';
import { ModalService } from '../service/modal.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  tags: string[] = [];
  times: string[] = [];
  lineProtocol: string[] = [];
  values: string[][] = [];
  firstdata: string[][] = [];
  lastdata: string[][] = [];
  filename: string = '';
  showTable = false;
  isCreateNewDatabase = false;

  constructor(private influx: InfluxService, private modal: ModalService) {}

  ngOnInit(): void {}

  onChangeExcelInput(ev: any) {
    const file = ev.target.files[0];
    this.filename = file.name;

    if (file.size < 100000000) {
      this.showTable = true;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.parseExcelFile(new Uint8Array(e.target!.result as ArrayBuffer));
      };
      reader.readAsArrayBuffer(file);
    } else {
      this.modal
        .message('Error', 'Files larger than 100MB cannot be uploaded.')
        .then()
        .catch();
    }
  }

  onClickCreateNewDatabase(flag: boolean) {
    this.isCreateNewDatabase = flag;
  }

  parseExcelFile(array: Uint8Array) {
    const parser = ExcelParser.createExcelParser(array);
    if (parser.sheets.length > 0) {
      const sheet = parser.sheets[0];
      if (sheet.isAvailable) {
        const dt = sheet.parseExcelFile();
        this.tags = sheet.tags;
        this.tags.unshift('timestamp');

        this.times = sheet.timeStampArray.map((itm) => {
          return new Date(itm).toLocaleString(); // moment(new Date(itm)).format("YYYY-MM-DD HH:mm");
        });

        this.values = sheet.timeStampArray.map((itm) => {
          const values = Object.values(dt!.valuesWithTimeStamp(itm));
          return values.map((itm2) => (isNaN(itm2) ? '' : itm2.toFixed(2)));
        });

        this.firstdata = this.values.slice(0, 5);
        this.lastdata = this.values.slice(-5);
        this.lineProtocol = dt!.toLineProtocolFormat();
      }
    }
  }

  onClickWriteInflux() {
    if (this.lineProtocol.length > 0) {
      if (this.isCreateNewDatabase) {
        this.writeInfluxNew();
      } else {
        this.writeInfluxExisting();
      }
    } else {
      this.modal.message('Message', 'No data for upload');
    }
  }

  writeInfluxNew() {
    this.influx
      .deleteAllHistoricalData()
      .pipe(concatMap((_) => this.influx.writeData(this.lineProtocol)))
      .subscribe((_) => {
        this.filename = '';
        this.modal.message('Message', 'Uploaded!');
      });
  }

  writeInfluxExisting() {
    this.influx.writeData(this.lineProtocol).subscribe((_) => {
      this.filename = '';
      this.modal.message('Message', 'Uploaded!');
    });
  }
}
