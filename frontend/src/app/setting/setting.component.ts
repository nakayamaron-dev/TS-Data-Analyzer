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
  isLoading = false;
  showTable = false;

  constructor(private influx: InfluxService, private modal: ModalService) {}

  ngOnInit(): void {}

  onChangeExcelInput(ev: any) {
    const file = ev.target.files[0];
    this.filename = file.name;

    if (file.size < 100000000) {
      this.isLoading = true;
      this.showTable = true;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.parseExcelFile(new Uint8Array(e.target!.result as ArrayBuffer));
        this.isLoading = false;
      };
      reader.readAsArrayBuffer(file);
    } else {
      this.modal
        .message('Error', 'Files larger than 100MB cannot be uploaded.')
        .then()
        .catch();
    }
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

  writeInflux() {
    if (this.lineProtocol.length > 0) {
      this.isLoading = true;

      this.influx
        .deleteAllHistoricalData()
        .pipe(concatMap((res) => this.influx.writeData(this.lineProtocol)))
        .subscribe((res) => {
          this.isLoading = false;
          this.filename = '';
          this.modal.message('Message', 'Uploaded!');
        });
    } else {
      this.modal.message('Message', 'No data for upload');
    }
  }
}
