import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongoService {

  constructor(private http: HttpClient) { }

  getPlotInfo(): Observable<any> {
    return this.http.get<any>('/api/v1/info/plotinfo', { responseType: 'json' });
  }

  updatePlotInfo(data: any): Observable<any> {
    return this.http.patch('/api/v1/info/plotinfo', data)
  }
}
