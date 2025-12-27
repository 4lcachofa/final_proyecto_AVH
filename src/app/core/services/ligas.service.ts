import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Liga {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
}

export interface LigaRequest {
  nombre: string;
  categoria: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class LigasService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // públicos
  listPublic(): Observable<Liga[]> {
    return this.http.get<Liga[]>(`${this.base}/api/ligas`);
  }
  getPublic(id: number): Observable<Liga> {
    return this.http.get<Liga>(`${this.base}/api/ligas/${id}`);
  }

  // con JWT
  create(body: LigaRequest): Observable<Liga> {
    return this.http.post<Liga>(`${this.base}/api/ligas`, body);
  }
  update(id: number, body: LigaRequest): Observable<Liga> {
    return this.http.put<Liga>(`${this.base}/api/ligas/${id}`, body);
  }
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/ligas/${id}`);
  }

  // extra
  listEquiposByLiga(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/ligas/${id}/equipos`);
  }
}
