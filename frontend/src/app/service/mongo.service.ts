import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Igraph } from '../visualizer/visualizer.component';

@Injectable({
  providedIn: 'root'
})
export class MongoService {

  constructor(private http: HttpClient) { }

  getPlotInfoAll(): Observable<any> {
    return this.http.get<any>('/api/v1/info/plotinfo/list', { responseType: 'json' });
  }

  getPlotInfo(id: number): Observable<any> {
    return this.http.get<any>(`/api/v1/info/plotinfo/${id}`, { responseType: 'json' });
  }

  updatePlotInfo(data: Igraph): Observable<any> {
    return this.http.patch(`/api/v1/info/plotinfo`, data)
  }
}
