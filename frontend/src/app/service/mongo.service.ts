import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IplotMulti } from '../visualizer/visualizer.component';

@Injectable({
  providedIn: 'root'
})
export class MongoService {

  constructor(private http: HttpClient) { }

  getTSmultiInfoAll(): Observable<any> {
    return this.http.get<any>('/api/v1/mongo/tsmulti/list', { responseType: 'json' });
  }

  getTSmultiInfo(id: number): Observable<any> {
    return this.http.get<any>(`/api/v1/mongo/tsmulti/${id}`, { responseType: 'json' });
  }

  updateTSmultiInfo(data: IplotMulti): Observable<any> {
    return this.http.patch(`/api/v1/mongo/tsmulti`, data);
  }

  deleteTSmultiInfo(id: number): Observable<any> {
    return this.http.delete(`/api/v1/mongo/tsmulti/${id}`);
  }
}
