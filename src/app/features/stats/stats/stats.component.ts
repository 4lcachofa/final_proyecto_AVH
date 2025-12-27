import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LigasService, Liga } from '../../../core/services/ligas.service';
import { EquiposService, Equipo } from '../../../core/services/equipos.service';
import { JugadoresService, Jugador } from '../../../core/services/jugadores.service';
import { EntrenadoresService, Entrenador } from '../../../core/services/entrenadores.service';
import { CompetenciasService, Competencia } from '../../../core/services/competencias.service';

type TeamRow = {
  equipoId: number;
  nombre: string;
  ligaNombre?: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
};

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent {
  loading = true;
  error = '';

  ligas: Liga[] = [];
  equipos: Equipo[] = [];
  jugadores: Jugador[] = [];
  entrenadores: Entrenador[] = [];
  competencias: Competencia[] = [];

  // KPIs
  totalLigas = 0;
  totalEquipos = 0;
  totalJugadores = 0;
  totalEntrenadores = 0;

  totalCompetencias = 0;
  pendientes = 0;
  finalizadas = 0;

  // Extras
  jugadoresPorLiga: { liga: string; count: number; pct: number }[] = [];
  topEquipos: TeamRow[] = [];

  constructor(
    private ligasSvc: LigasService,
    private equiposSvc: EquiposService,
    private jugadoresSvc: JugadoresService,
    private entrenadoresSvc: EntrenadoresService,
    private competenciasSvc: CompetenciasService
  ) {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = '';

    // Cargamos todo y luego calculamos (secuencial simple y estable)
    this.ligasSvc.listPublic().subscribe({
      next: (l) => (this.ligas = l),
      error: () => (this.error = 'No se pudieron cargar ligas.'),
      complete: () => {
        this.equiposSvc.list().subscribe({
          next: (e) => (this.equipos = e),
          error: () => (this.error = 'No se pudieron cargar equipos (JWT).'),
          complete: () => {
            this.jugadoresSvc.list().subscribe({
              next: (j) => (this.jugadores = j),
              error: () => (this.error = 'No se pudieron cargar jugadores (JWT).'),
              complete: () => {
                this.entrenadoresSvc.list().subscribe({
                  next: (t) => (this.entrenadores = t),
                  error: () => (this.error = 'No se pudieron cargar entrenadores (JWT).'),
                  complete: () => {
                    this.competenciasSvc.list().subscribe({
                      next: (c) => (this.competencias = c),
                      error: () => (this.error = 'No se pudieron cargar competencias (JWT).'),
                      complete: () => {
                        this.compute();
                        this.loading = false;
                      },
                    });
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  compute() {
    // KPIs
    this.totalLigas = this.ligas.length;
    this.totalEquipos = this.equipos.length;
    this.totalJugadores = this.jugadores.length;
    this.totalEntrenadores = this.entrenadores.length;

    this.totalCompetencias = this.competencias.length;
    this.finalizadas = this.competencias.filter(c => !!c.finalizado).length;
    this.pendientes = this.totalCompetencias - this.finalizadas;

    // Jugadores por liga (barras)
    const mapLigaCount = new Map<number, number>();
    for (const j of this.jugadores) {
      const key = j.ligaId;
      mapLigaCount.set(key, (mapLigaCount.get(key) ?? 0) + 1);
    }

    const max = Math.max(1, ...Array.from(mapLigaCount.values()));
    this.jugadoresPorLiga = this.ligas.map(l => {
      const count = mapLigaCount.get(l.id) ?? 0;
      return { liga: l.nombre, count, pct: Math.round((count / max) * 100) };
    }).sort((a, b) => b.count - a.count);

    // Tabla “Top Equipos” calculada con competencias FINALIZADAS
    const team = new Map<number, TeamRow>();

    const ensure = (equipoId: number, nombre: string, ligaNombre?: string) => {
      if (!team.has(equipoId)) {
        team.set(equipoId, {
          equipoId,
          nombre,
          ligaNombre,
          pj: 0, g: 0, e: 0, p: 0,
          gf: 0, gc: 0, dg: 0, pts: 0
        });
      }
      return team.get(equipoId)!;
    };

    // Si tu backend ya trae nombres, los usamos. Si no, caemos a EquiposService.
    const getEquipo = (id: number) => this.equipos.find(x => x.id === id);

    for (const c of this.competencias.filter(x => !!x.finalizado)) {
      const local = getEquipo(c.equipoLocalId);
      const visita = getEquipo(c.equipoVisitaId);

      const localRow = ensure(c.equipoLocalId, c.equipoLocalNombre || local?.nombre || `#${c.equipoLocalId}`, local?.ligaNombre);
      const visRow   = ensure(c.equipoVisitaId, c.equipoVisitaNombre || visita?.nombre || `#${c.equipoVisitaId}`, visita?.ligaNombre);

      localRow.pj++; visRow.pj++;
      localRow.gf += (c.golesLocal ?? 0);
      localRow.gc += (c.golesVisita ?? 0);

      visRow.gf += (c.golesVisita ?? 0);
      visRow.gc += (c.golesLocal ?? 0);

      if ((c.golesLocal ?? 0) > (c.golesVisita ?? 0)) {
        localRow.g++; localRow.pts += 3;
        visRow.p++;
      } else if ((c.golesLocal ?? 0) < (c.golesVisita ?? 0)) {
        visRow.g++; visRow.pts += 3;
        localRow.p++;
      } else {
        localRow.e++; localRow.pts += 1;
        visRow.e++; visRow.pts += 1;
      }
    }

    const rows = Array.from(team.values()).map(r => {
      r.dg = r.gf - r.gc;
      return r;
    });

    // Orden “tabla” clásica: pts, dg, gf
    this.topEquipos = rows
      .sort((a, b) =>
        (b.pts - a.pts) ||
        (b.dg - a.dg) ||
        (b.gf - a.gf)
      )
      .slice(0, 8);
  }

  pct(part: number, total: number) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  }
}
