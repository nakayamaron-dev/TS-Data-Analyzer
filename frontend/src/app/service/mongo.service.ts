import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IplotMulti } from '../ts-multi/tsmulti.component';
import { ItagInfo } from '../data-description/data-description.component';
import { IplotHist } from '../histogram/histogram.component';
import { IplotScatter } from '../scatter/scatter.component';
import { IplotSingle } from '../ts-single/ts-single.component';

export interface IgeneralSetting {
  _id: any;
  dateRange: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MongoService {
  constructor(private http: HttpClient) {}

  getTSSingleInfoAll(): Observable<IplotSingle[]> {
    return this.http
      .get<IplotSingle[]>('/api/v1/mongo/tssingle/list', {
        responseType: 'json',
      })
      .pipe(
        map((res) => {
          const ret: IplotSingle[] = [];

          res.forEach((itm) => {
            ret.push({
              _id: itm._id,
              tag: itm.tag,
              xbin: itm.xbin,
              datasets: [],
            });
          });

          return ret;
        })
      );
  }

  getTSSingleInfo(id: number): Observable<IplotSingle> {
    return this.http
      .get<IplotSingle>(`/api/v1/mongo/tssingle/${id}`, {
        responseType: 'json',
      })
      .pipe(
        map((res) => {
          const ret: IplotSingle = {
            _id: res._id,
            tag: res.tag,
            xbin: res.xbin,
            datasets: [],
          };
          return ret;
        })
      );
  }

  updateTSSingleInfo(data: IplotSingle[]): Observable<any> {
    return this.http.patch(`/api/v1/mongo/tssingle`, data);
  }

  deleteTSSingleInfo(data: IplotSingle[]): Observable<any> {
    return this.http.delete(`/api/v1/mongo/tssingle`, { body: data });
  }

  getTSmultiInfoAll(): Observable<IplotMulti[]> {
    return this.http
      .get<IplotMulti[]>('/api/v1/mongo/tsmulti/list', { responseType: 'json' })
      .pipe(
        map((res) => {
          const ret: IplotMulti[] = [];

          res.forEach((itm) => {
            ret.push({
              _id: itm._id,
              items: itm.items,
              datasets: [],
            });
          });

          return ret;
        })
      );
  }

  getTSmultiInfo(id: number): Observable<IplotMulti> {
    return this.http
      .get<IplotMulti>(`/api/v1/mongo/tsmulti/${id}`, { responseType: 'json' })
      .pipe(
        map((res) => {
          const ret: IplotMulti = {
            _id: res._id,
            items: res.items,
            datasets: [],
          };
          return ret;
        })
      );
  }

  updateTSmultiInfo(data: IplotMulti[]): Observable<any> {
    return this.http.patch(`/api/v1/mongo/tsmulti`, data);
  }

  deleteTSmultiInfo(data: IplotMulti[]): Observable<any> {
    return this.http.delete(`/api/v1/mongo/tsmulti`, { body: data });
  }

  getTagInfo(): Observable<ItagInfo> {
    return this.http.get<ItagInfo>(`api/v1/mongo/taginfo`, {
      responseType: 'json',
    });
  }

  updateTagInfo(data: ItagInfo): Observable<any> {
    return this.http.patch(`api/v1/mongo/taginfo`, data);
  }

  getHistogramInfo(): Observable<IplotHist[]> {
    return this.http.get<IplotHist[]>(`api/v1/mongo/histogram/list`, {
      responseType: 'json',
    });
  }

  updateHistogramInfo(data: IplotHist[]) {
    return this.http.patch(`api/v1/mongo/histogram`, data);
  }

  deleteHistogramInfo(data: IplotHist[]): Observable<any> {
    return this.http.delete(`/api/v1/mongo/histogram`, { body: data });
  }

  getScatterInfo(): Observable<IplotScatter[]> {
    return this.http.get<IplotScatter[]>(`api/v1/mongo/scatter/list`, {
      responseType: 'json',
    });
  }

  updateScatterInfo(data: IplotScatter[]) {
    return this.http.patch(`api/v1/mongo/scatter`, data);
  }

  deleteScatterInfo(data: IplotScatter[]): Observable<any> {
    return this.http.delete(`/api/v1/mongo/scatter`, { body: data });
  }

  getGeneralSettings(): Observable<IgeneralSetting> {
    return this.http.get<IgeneralSetting>(`api/v1/mongo/generalsettings`);
  }

  updateGeneralSettings(data: IgeneralSetting) {
    return this.http.patch('api/v1/mongo/generalsettings', data);
  }
}
