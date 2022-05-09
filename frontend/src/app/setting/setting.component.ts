import { Component, OnInit } from '@angular/core';
import { concatMap, forkJoin } from 'rxjs';
import { ExcelParser } from '../service/excel-parser';
import { Idatabases, InfluxService } from '../service/influx.service';
import { MongoService } from '../service/mongo.service';
import { ModalService } from '../service/modal.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  lineProtocol: string[] = [];
  filename: string = '';
  DShostInfo: string = '';
  DSdbName: string = '';
  dbState: string = '';
  CDhostInfo: string = '';
  CDdbName: string = '';
  createResult: string = '';
  isDatabaseOk = false;
  isCreateNewDatabase = false;

  constructor(
    private influx: InfluxService,
    private modal: ModalService,
    private mongo: MongoService
  ) {}

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

  onInputDSHostInfo(val: string) {
    this.DShostInfo = val;
  }

  onInputDSDatabaseName(val: string) {
    this.DSdbName = val;
  }

  onInputCDHostInfo(val: string) {
    this.CDhostInfo = val;
  }

  onInputCDDatabaseName(val: string) {
    this.CDdbName = val;
  }

  checkDisableDBCheck() {
    return this.DShostInfo === '';
  }

  checkDisableCreateDB() {
    return this.CDhostInfo === '' || this.CDdbName === '';
  }

  checkDisableWrite() {
    return (
      this.dbState === '' ||
      this.dbState === 'Database is not hosted.' ||
      this.lineProtocol.length === 0
    );
  }

  onClickDatabaseCheck() {
    this.influx.getDatabases(this.DShostInfo).subscribe(
      (res) => {
        const databases = res.map((itm) => itm.name);

        if (databases.includes(this.DSdbName)) {
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

  onClickCreateDatabase() {
    const data: Idatabases = {
      host: this.CDhostInfo,
      name: this.CDdbName,
    };
    this.influx.createDatabase(data).subscribe((res) => {
      if (res === 'status ok') {
        this.createResult = `Created ${this.CDhostInfo}/${this.CDdbName}`;
      } else {
        this.createResult = `Failed to create ${this.CDhostInfo}/${this.CDdbName}`;
      }
    });
  }

  initializeMongoDB() {}
}
