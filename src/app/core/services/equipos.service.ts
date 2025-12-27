import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Equipo {
  id: number;
  nombre: string;
  apodo: string;
  ligaId: number;
  ligaNombre: string;
  entrenadorId: number | null;
  entrenadorNombre: string | null;
}

export interface EquipoRequest {
  nombre: string;
  apodo: string;
  ligaId: number;
}

@Injectable({ providedIn: 'root' })
export class EquiposService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  list(): Observable<Equipo[]> {
    return this.http.get<Equipo[]>(`${this.base}/api/equipos`);
  }

  getById(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.base}/api/equipos/${id}`);
  }

  create(body: EquipoRequest): Observable<Equipo> {
    return this.http.post<Equipo>(`${this.base}/api/equipos`, body);
  }

  update(id: number, body: EquipoRequest): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.base}/api/equipos/${id}`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/equipos/${id}`);
  }

  // Asignar entrenador
  asignarEntrenador(equipoId: number, entrenadorId: number): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.base}/api/equipos/${equipoId}/entrenador/${entrenadorId}`, {});
  }

  quitarEntrenador(equipoId: number): Observable<any> {
    return this.http.delete(`${this.base}/api/equipos/${equipoId}/entrenador`);
  }

  // listar jugadores por equipo
  jugadoresByEquipo(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/api/equipos/${id}/jugadores`);
  }
}
