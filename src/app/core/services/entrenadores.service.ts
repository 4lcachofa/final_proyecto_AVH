import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Entrenador {
  id: number;
  nombre: string;
  experienciaAnios: number;
  especialidad: string;
}

export interface EntrenadorRequest {
  nombre: string;
  experienciaAnios: number;
  especialidad: string;
}

@Injectable({ providedIn: 'root' })
export class EntrenadoresService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  list(): Observable<Entrenador[]> {
    return this.http.get<Entrenador[]>(`${this.base}/api/entrenadores`);
  }

  getById(id: number): Observable<Entrenador> {
    return this.http.get<Entrenador>(`${this.base}/api/entrenadores/${id}`);
  }

  create(body: EntrenadorRequest): Observable<Entrenador> {
    return this.http.post<Entrenador>(`${this.base}/api/entrenadores`, body);
  }

  update(id: number, body: EntrenadorRequest): Observable<Entrenador> {
    return this.http.put<Entrenador>(`${this.base}/api/entrenadores/${id}`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/entrenadores/${id}`);
  }
}
