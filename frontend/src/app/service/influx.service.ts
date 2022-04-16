import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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

@Injectable({
  providedIn: 'root'
})
export class InfluxService {

  constructor(private http: HttpClient) {

  }

  getHistoricalData(tags: string[], measurement: string = 'rawdata', fromDate?: string | undefined, toDate?: string | undefined):
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
    return this.http.get<string>(`/api/v1/ts/${measurement}/timestamp/last`);
  }

  getDefaultYrangeList(tags: string[], measurement: string='rawdata', fromDate?: string, toDate?: string): Observable<IdefaultYranges> {
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

}
