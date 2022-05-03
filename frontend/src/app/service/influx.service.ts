import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { concat, Observable, of, zip } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';

interface IGetData {
  time: string;
  tag: string;
  value: number;
}

export interface IHistoricalValue<T> {
  timeStamp: T;
  value: number;
}

export interface IdefaultYranges {
  [tag: string]: {
      min: number,
      max: number
  }
}

export interface DatasetValuesSummaryInfo {
  count: Record<string, string>;
  mean: Record<string, string>;
  std: Record<string, string>;
  min: Record<string, string>;
  '25%': Record<string, string>;
  '50%': Record<string, string>;
  '75%': Record<string, string>;
  max: Record<string, string>;
}

export interface CorrelationCoefficientMatrixInfo {
  x: string[];
  y: string[];
  matrix: number[][];
}

@Injectable({
  providedIn: 'root'
})
export class InfluxService {

  constructor(private http: HttpClient) {

  }

  getHistoricalData(tags: string[], fromDate?: string, toDate?: string, measurement: string = 'rawdata'):
   Observable<{[tag: string]: IHistoricalValue<string>[]}> {
    let qstr = '?tags=' + tags.join(',');

    if ( fromDate !== undefined) { qstr += '&from=' + fromDate; }
    if ( toDate !== undefined) { qstr += '&to=' + toDate; }

    if ( tags.length === 0 ) {
        return of({});
    }

    return this.http.get<IGetData[]>(`/api/v1/ts/${measurement}/` + qstr, { responseType: 'json' })
        .pipe(
            map( res => {
                const ret: {[tag: string]: IHistoricalValue<string>[]} = {};
                res.forEach( value => {
                    if ( !ret[value.tag] ) { ret[value.tag] = []; }
                    ret[value.tag].push({ timeStamp: value.time, value: value.value });
                });
                return ret;
            })
        );
      }
  
  getTagList(measurement: string = 'rawdata'): Observable<string[]> {
    return this.http.get<IGetData[]>(`/api/v1/ts/${measurement}/last`, { responseType: 'json' })
    .pipe(
      map(res => {
        const ret: string[] = [];
        res.forEach(itm => {
          ret.push(itm.tag)
        })

        return ret;
      })
    )
  }

  getLatestTimeStamp(measurement: string = "rawdata"): Observable<string> {
    return this.http.get<string>(`/api/v1/ts/${measurement}/timestamp/last`)
  }

  getDefaultYrangeList(tags: string[], fromDate?: string, toDate?: string, measurement: string = 'rawdata'): Observable<IdefaultYranges> {
    let qstr = '?tags=' + tags.join(',');

    if ( fromDate !== undefined) { qstr += '&from=' + fromDate; }
    if ( toDate !== undefined) { qstr += '&to=' + toDate; }

    if ( tags.length === 0 ) {
        return of({});
    }

    return this.http.get<IGetData[]>(`/api/v1/ts/${measurement}/` + qstr, { responseType: 'json' })
    .pipe(
      map(res => {
        const tmp: {[tag: string]: IHistoricalValue<string>[]} = {};
        res.forEach( value => {
            if ( !tmp[value.tag] ) { tmp[value.tag] = []; }
            tmp[value.tag].push({ timeStamp: value.time, value: value.value });
        });

        const ret: IdefaultYranges = {};
        res.forEach(itm => {
          ret[itm.tag] = {
            min: Math.min(...tmp[itm.tag].map(cell => cell.value)),
            max: Math.max(...tmp[itm.tag].map(cell => cell.value)),
          }
        })
        return ret
      })
    )
  }

  deleteAllHistoricalData(): Observable<any> {
    return this.http.delete('/api/v1/ts/delete?tags=all');
  }

  writeData(lineProtocolData: string[]): Observable<HttpResponse<any>> {
    return this.http.post('/api/v1/ts/rawdata/upload', lineProtocolData.join('\n'), { observe: 'response'});
}

  getDatasetSummary(): Observable<DatasetValuesSummaryInfo> {
    let datasetValuesSummaryInfo: DatasetValuesSummaryInfo = {
      count: {},
      mean: {},
      std: {},
      min: {},
      '25%': {},
      '50%': {},
      '75%': {},
      max: {},
    }

    return this.getTagList().pipe(
      concatMap(tagList => this.getHistoricalData(tagList).pipe(
        map(res => {
          (Object.keys(datasetValuesSummaryInfo) as (keyof DatasetValuesSummaryInfo)[]).forEach(key => {
            Object.keys(res).forEach(tag => {
              datasetValuesSummaryInfo[key][tag] = this.calcSummary(res[tag].map(itm => itm.value), key);
            })
          })
          return datasetValuesSummaryInfo;
        })
        )
      )
    )
  }

  getCorrelationCoefficientMatrix(): Observable<CorrelationCoefficientMatrixInfo> {
    const result: CorrelationCoefficientMatrixInfo = {
      x: [],
      y: [],
      matrix: []
    }

    return this.getTagList().pipe(
      concatMap(tagList => this.getHistoricalData(tagList).pipe(
        map(res => {

          result.x = tagList;
          result.y = tagList;

          Object.keys(res).forEach(tag_x => {
            const row: number[] = [];
            Object.keys(res).forEach(tag_y => {
              row.push(this.calcCorrelationCoefficient(res[tag_x].map(itm => itm.value), res[tag_y].map(itm => itm.value)))
            })
            result.matrix.push(row);
          })
          return result;
        })
      ))
    )
  }

  public calcCorrelationCoefficient(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    const std_x = Math.sqrt(this.calcVariance(x));
    const std_y = Math.sqrt(this.calcVariance(y));
    const avg_x = this.calcAverage(x);
    const avg_y = this.calcAverage(y);
    let covar = 1;

    for (let i = 0; i < n; i++) {
      covar += (x[i] - avg_x) * (y[i] - avg_y)
    }

    covar /= n;

    return Number((covar / (std_x * std_y)).toFixed(2));
  }

  public calcSummary(numbers: number[], key: keyof(DatasetValuesSummaryInfo)): string {
    switch(key) {
      case 'count':
        return numbers.length.toFixed();
      case 'mean':
        return this.calcAverage(numbers).toFixed(2);
      case 'std':
        return Math.sqrt(this.calcVariance(numbers)).toFixed(2);
      case 'min':
        return numbers.length > 0 ? Math.min(...numbers).toFixed(2) : '';
      case '25%':
        return this.calcQuartile(numbers, 0.25).toFixed(2);
      case '50%':
        return this.calcQuartile(numbers, 0.5).toFixed(2);
      case '75%':
        return this.calcQuartile(numbers, 0.75).toFixed(2);
      case 'max':
        return numbers.length > 0 ? Math.max(...numbers).toFixed(2) :'';
      default:
        return '';
    }
  }

  public calcSum(numbers: number[], initialValue: number = 0): number {
    if (numbers.length === 0) { return NaN }

    return numbers.reduce(
      (accumulator: number, currentValue: number) => accumulator + currentValue,
      initialValue
    )
  }

  public calcAverage(numbers: number[]): number {
    if (numbers.length === 0) { return NaN }

    return this.calcSum(numbers) / numbers.length;
  }

  public calcVariance(numbers:number[]): number {
    if (numbers.length === 0) { return NaN }

    const average = this.calcAverage(numbers);
    const length = numbers.length;

    const squaredDifference = numbers.map((current) => {
      const difference = current - average;
      return difference ** 2;
    });

    return squaredDifference.reduce((previous, current) => previous + current) / length;
  }

  public calcQuartile(numbers: number[], q: number): number {
    if (numbers.length === 0) { return NaN }

    numbers = numbers.sort((a, b) => a - b);
    const pos = ((numbers.length) - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if( (numbers[base+1] !== undefined) ) {
      return numbers[base] + rest * (numbers[base+1] - numbers[base]);
    } else {
      return numbers[base];
    }
  }
}
