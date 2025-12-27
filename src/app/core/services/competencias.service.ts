import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Competencia {
  id: number;
  fecha: string;
  lugar: string;
  equipoLocalId: number;
  equipoLocalNombre: string;
  equipoVisitaId: number;
  equipoVisitaNombre: string;
  golesLocal: number;
  golesVisita: number;
  finalizado: boolean;
}

/**
 * Agenda (crear/editar):
 * Normalmente el backend pide esto para POST y PUT /{id}
 */
export interface CompetenciaAgendaRequest {
  fecha: string;          // ISO string
  lugar: string;
  equipoLocalId: number;
  equipoVisitaId: number;
}

/**
 * Resultado:
 * PUT /api/competencias/{id}/resultado
 */
export interface CompetenciaResultadoRequest {
  golesLocal: number;
  golesVisita: number;
  finalizado: boolean;
}

@Injectable({ providedIn: 'root' })
export class CompetenciasService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  list(): Observable<Competencia[]> {
    return this.http.get<Competencia[]>(`${this.base}/api/competencias`);
  }

  getById(id: number): Observable<Competencia> {
    return this.http.get<Competencia>(`${this.base}/api/competencias/${id}`);
  }

  create(body: CompetenciaAgendaRequest): Observable<Competencia> {
    return this.http.post<Competencia>(`${this.base}/api/competencias`, body);
  }

  updateAgenda(id: number, body: CompetenciaAgendaRequest): Observable<Competencia> {
    return this.http.put<Competencia>(`${this.base}/api/competencias/${id}`, body);
  }

  updateResultado(id: number, body: CompetenciaResultadoRequest): Observable<Competencia> {
    return this.http.put<Competencia>(`${this.base}/api/competencias/${id}/resultado`, body);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/competencias/${id}`);
  }
}
