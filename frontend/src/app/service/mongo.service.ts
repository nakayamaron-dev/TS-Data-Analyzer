import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IplotMulti } from '../visualizer/visualizer.component';

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
}
