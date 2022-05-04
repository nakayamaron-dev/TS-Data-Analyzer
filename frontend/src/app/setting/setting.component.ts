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
  lineProtocol: string[] = [];
  filename: string = '';
  hostInfo: string = '';
  dbName: string = '';
  dbState: string = '';
  isDatabaseOk = false;
  isCreateNewDatabase = false;

  constructor(private influx: InfluxService, private modal: ModalService) {}

  ngOnInit(): void {}

  onChangeExcelInput(ev: any) {
    const file = ev.target.files[0];
    this.filename = file.name;

    if (file.size < 100000000) {
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

  onInputHostInfo(val: string) {
    this.hostInfo = val;
  }

  onInputDatabaseName(val: string) {
    this.dbName = val;
  }

  checkDisableDBCheck() {
    return this.hostInfo === '';
  }

  checkDisableWrite() {
    return (
      this.dbState === '' ||
      this.dbState === 'Database is not hosted.' ||
      this.lineProtocol.length === 0
    );
  }

  onClickDatabaseCheck() {
    this.influx.getDatabases(this.hostInfo).subscribe(
      (res) => {
        const databases = res.map((itm) => itm.name);

        if (databases.includes(this.dbName)) {
          this.dbState = 'host is OK. database is existing.';
        } else {
          this.dbState = 'host is OK. database is not existing.';
        }
      },
      (err) => {
        this.dbState = 'Database is not hosted.';
      }
    );
  }
}
