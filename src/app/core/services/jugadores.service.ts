import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Jugador {
  id: number;
  nombre: string;
  posicion: string;
  numero: number;
  edad: number;
  equipoId: number;
  equipoNombre: string;
  ligaId: number;
  ligaNombre: string;
}

export interface JugadorRequest {
  nombre: string;
  posicion: string;
  numero: number;
  edad: number;
  equipoId: number;
}

@Injectable({ providedIn: 'root' })
export class JugadoresService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  list(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.base}/api/jugadores`);
  }

  getById(id: number): Observable<Jugador> {
    return this.http.get<Jugador>(`${this.base}/api/jugadores/${id}`);
  }

  create(body: JugadorRequest): Observable<Jugador> {
    return this.http.post<Jugador>(`${this.base}/api/jugadores`, body);
  }

  update(id: number, body: JugadorRequest): Observable<Jugador> {
    return this.http.put<Jugador>(`${this.base}/api/jugadores/${id}`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/jugadores/${id}`);
  }
}
