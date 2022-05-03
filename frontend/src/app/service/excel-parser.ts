import * as XLSX from 'xlsx';

class XlsxUtility {
  static cellValueToDate(cell: XLSX.CellObject | undefined): Date | undefined {
    if (!cell) {
      return undefined;
    }

    if (String(cell.v).trim() !== '') {
      if (cell.t === 'd') {
        // Date型で入っている
        return cell.v as Date;
      } else {
        // 文字列型で入っている
        const parsed_date = Date.parse(cell.v as string);
        if (!isNaN(parsed_date)) {
          return new Date(parsed_date);
        }
      }
    }
    return undefined;
  }

  static cellValueToString(
    cell: XLSX.CellObject | undefined
  ): string | undefined {
    if (!cell) {
      return undefined;
    }

    const val = String(cell.v).trim();
    if (val !== '' && cell.t === 's') {
      return val;
    }
    return undefined;
  }

  static cellValueToNumber(
    cell: XLSX.CellObject | undefined
  ): number | undefined {
    if (!cell) {
      return undefined;
    }

    if (cell.t === 'n') {
      return cell.v as number;
    } else if (cell.t === 's') {
      const num = parseFloat(cell.v as string);
      if (!isNaN(num)) {
        return num;
      }
    }
    return undefined;
  }
}

class ParsedTimeseriesValueArray {
  private valueArray: { [timeStamp: string]: { [tag: string]: number } };

  constructor(valueArray: { [timeStamp: string]: { [tag: string]: number } }) {
    this.valueArray = valueArray;
  }

  get array() {
    return this.valueArray;
  }

  valuesWithTimeStamp(timeStamp: string): { [tag: string]: number } {
    return this.valueArray[timeStamp];
  }

  valuesWithTag(tag: string): { [timestamp: string]: number } {
    return Object.keys(this.valueArray).reduce<{ [timestamp: string]: number }>(
      (res, timestamp) => {
        const data = this.valueArray[timestamp];
        const tagdata = Object.keys(data)
          .filter((key) => key === tag)
          .map((itm) => data[itm]);
        if (tagdata.length === 1) {
          res[timestamp] = tagdata[0];
        }
        return res;
      },
      {}
    );
  }

  toLineProtocolFormat(): string[] {
    const result: string[] = [];

    Object.keys(this.valueArray).forEach((timeStamp) => {
      const data = this.valueArray[timeStamp];
      const unixTime = Date.parse(timeStamp) * 1000 * 1000; // in nano sec
      Object.keys(data).forEach((tag) => {
        if (!isNaN(data[tag])) {
          result.push(`rawdata,tag=${tag} value=${data[tag]} ${unixTime}`);
        }
      });
    });
    return result;
  }
}

class ExcelSheetParser {
  private ws: XLSX.WorkSheet;
  private range: XLSX.Range;
  public isAvailable = false;
  private timeStampCells: { [timestamp: string]: XLSX.CellAddress };
  private tagCells: { [tag: string]: XLSX.CellAddress };

  constructor(ws: XLSX.WorkSheet) {
    this.ws = ws;
    this.range = XLSX.utils.decode_range(ws['!ref'] as string);
    this.timeStampCells = this.searchTimeStampRange();
    this.tagCells = this.searchTagRange();

    if (this.tags.length > 0 && this.timeStampArray.length > 0) {
      this.isAvailable = true;
    }
  }

  get tags(): string[] {
    return Object.keys(this.tagCells);
  }
  get timeStampArray(): string[] {
    return Object.keys(this.timeStampCells);
  }

  private searchTimeStampRange(): { [timestamp: string]: XLSX.CellAddress } {
    const timeStrArray: { [timestamp: string]: XLSX.CellAddress } = {};

    for (let c = this.range.s.c; c <= this.range.e.c; c++) {
      for (let r = this.range.s.r; r <= this.range.e.r; r++) {
        const address = XLSX.utils.encode_cell({ c: c, r: r });
        const dt = XlsxUtility.cellValueToDate(this.ws[address]);
        if (dt) {
          timeStrArray[dt.toISOString()] = { c: c, r: r };
        }
      }
      if (Object.keys(timeStrArray).length > 0) {
        break;
      }
    }
    return timeStrArray;
  }

  private searchTagRange(): { [tag: string]: XLSX.CellAddress } {
    const tagArray: { [tag: string]: XLSX.CellAddress } = {};

    for (let r = this.range.s.r; r <= this.range.e.r; r++) {
      for (let c = this.range.s.r; c <= this.range.e.c; c++) {
        const address = XLSX.utils.encode_cell({ c: c, r: r });
        const dt = XlsxUtility.cellValueToString(this.ws[address]);
        if (dt) {
          tagArray[dt] = { c: c, r: r };
        }
      }
      if (Object.keys(tagArray).length > 0) {
        break;
      }
    }
    return tagArray;
  }

  // ExcelファイルをparseしてtimeStampをkeyとした連想配列を作成して返す.
  parseExcelFile(): ParsedTimeseriesValueArray | undefined {
    if (this.isAvailable === false) {
      return undefined;
    }

    const array = this.timeStampArray.reduce<{
      [timeStamp: string]: { [tag: string]: number };
    }>((result, timestamp) => {
      result[timestamp] = this.tags.reduce<{ [tag: string]: number }>(
        (res, tag) => {
          const addrees = XLSX.utils.encode_cell({
            c: this.tagCells[tag].c,
            r: this.timeStampCells[timestamp].r,
          });
          const num = XlsxUtility.cellValueToNumber(this.ws[addrees]);
          res[tag] = num ? num : NaN;
          return res;
        },
        {}
      );

      return result;
    }, {});

    return Object.keys(array).length > 0
      ? new ParsedTimeseriesValueArray(array)
      : undefined;
  }
}

export class ExcelParser {
  private workbook: XLSX.WorkBook;
  sheets: ExcelSheetParser[];

  // Factory Method: Uint8 ArrayからExcelParserオブジェクトを作成
  static createExcelParser(array: Uint8Array): ExcelParser {
    const wb = XLSX.read(array, { type: 'array', cellDates: true });
    return new ExcelParser(wb);
  }

  constructor(wb: XLSX.WorkBook) {
    this.workbook = wb;
    this.sheets = wb.SheetNames.map(
      (name) => new ExcelSheetParser(wb.Sheets[name])
    );
  }

  get worksheetName(): string[] {
    return this.workbook.SheetNames;
  }
}
