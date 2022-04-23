import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IplotMulti } from '../ts-multi/tsmulti.component';
import { ItagInfo } from '../data-description/data-description.component';
import { IplotHist } from '../histogram/histogram.component';
import { IplotScatter } from '../scatter/scatter.component';

@Injectable({
  providedIn: 'root'
})
export class MongoService {

  constructor(private http: HttpClient) { }

  getTSmultiInfoAll(): Observable<IplotMulti[]> {
    return this.http.get<IplotMulti[]>('/api/v1/mongo/tsmulti/list', { responseType: 'json' })
    .pipe(
      map(res => {
        const ret: IplotMulti[] = [];

        res.forEach(itm => {
          ret.push(
            {
              _id: itm._id,
              items: itm.items,
              dateRange: itm.dateRange,
              datasets: []
            }
          )
        })

        return ret;
      })
    );
  }

  getTSmultiInfo(id: number): Observable<IplotMulti> {
    return this.http.get<IplotMulti>(`/api/v1/mongo/tsmulti/${id}`, { responseType: 'json' })
    .pipe(
      map(res => {
        const ret: IplotMulti = {
          _id: res._id,
          items: res.items,
          dateRange: res.dateRange,
          datasets: []
        }
        return ret;
      })
    )
  }

  updateTSmultiInfo(data: IplotMulti[]): Observable<any> {
    return this.http.patch(`/api/v1/mongo/tsmulti`, data);
  }

  deleteTSmultiInfo(data: IplotMulti[]): Observable<any> {
    return this.http.delete(`/api/v1/mongo/tsmulti`, {body: data});
  }

  getTagInfo(): Observable<ItagInfo> {
    return this.http.get<ItagInfo>(`api/v1/mongo/taginfo`, { responseType: 'json' });
  }

  updateTagInfo(data: ItagInfo): Observable<any> {
    return this.http.patch(`api/v1/mongo/taginfo`, data);
  }

  getHistogramInfo(): Observable<IplotHist[]> {
    return this.http.get<IplotHist[]>(`api/v1/mongo/histogram/list`, { responseType: 'json' });
  }

  updateHistogramInfo(data: IplotHist[]) {
    return this.http.patch(`api/v1/mongo/histogram`, data);
  }

  deleteHistogramInfo(data: IplotHist[]): Observable<any> {
    return this.http.delete(`/api/v1/mongo/histogram`, {body: data});
  }

  getScatterInfo(): Observable<IplotScatter[]> {
    return this.http.get<IplotScatter[]>(`api/v1/mongo/scatter/list`, { responseType: 'json' });
  }

  updateScatterInfo(data: IplotScatter[]) {
    return this.http.patch(`api/v1/mongo/scatter`, data);
  }

  deleteScatterInfo(data: IplotScatter[]): Observable<any> {
    return this.http.delete(`/api/v1/mongo/scatter`, {body: data});
  }
}
