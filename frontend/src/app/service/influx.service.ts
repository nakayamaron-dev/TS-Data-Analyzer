import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {timer, Observable, of, forkJoin} from 'rxjs';
import {exhaustMap, map} from 'rxjs/operators';

interface IGetData {
  time: string;
  tag: string;
  value: number;
}

export interface IHistoricalValue<T> {
  timeStamp: T;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class InfluxService {

  constructor(private http: HttpClient) {

  }

  getHistoricalData(tags: string[], measurement: string = 'rawdata', fromDate?: string, toDate?: string):
   Observable<{[tag: string]: IHistoricalValue<string>[]}> {
    let qstr = '?tags=' + tags.join(',');

    if ( fromDate !== undefined) { qstr += '&from=' + fromDate; }
    if ( toDate !== undefined) { qstr += '&to=' + toDate; }

    if ( tags.length === 0 ) {
        return of({});
    }

    return this.http.get<IGetData[]>(`/api/v1/ts/${measurement}/` + qstr, { responseType: 'json' })
        .pipe(
            map( response => {
                const ret: {[tag: string]: IHistoricalValue<string>[]} = {};
                response.forEach( value => {
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

}
