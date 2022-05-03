import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import { my_math } from '../library/math';

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

  my_math = new my_math();

  constructor(private http: HttpClient) { }

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
              datasetValuesSummaryInfo[key][tag] = this.my_math.calcSummary(res[tag].map(itm => itm.value), key);
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
              const x = res[tag_x].map(itm => itm.value);
              const y = res[tag_y].map(itm => itm.value);
              row.push(this.my_math.calcCorrelationCoefficient(x, y))
            })
            result.matrix.push(row);
          })
          return result;
        })
      ))
    )
  }
}
