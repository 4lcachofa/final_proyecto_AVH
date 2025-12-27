import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CompetenciasService,
  Competencia,
  CompetenciaAgendaRequest,
  CompetenciaResultadoRequest
} from '../../../core/services/competencias.service';

import { EquiposService, Equipo } from '../../../core/services/equipos.service';

type ModalType = 'none' | 'create' | 'editAgenda' | 'resultado' | 'confirmDelete';

@Component({
  selector: 'app-competencias-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competencias-list.component.html',
  styleUrl: './competencias-list.component.css',
})
export class CompetenciasListComponent {
  loading = true;
  saving = false;
  error = '';

  competencias: Competencia[] = [];
  equipos: Equipo[] = [];

  modal: ModalType = 'none';
  selected: Competencia | null = null;

  agendaForm = this.fb.group({
    fecha: ['', [Validators.required]], // datetime-local
    lugar: ['', [Validators.required, Validators.minLength(2)]],
    equipoLocalId: [null as any as number, [Validators.required]],
    equipoVisitaId: [null as any as number, [Validators.required]],
  });

  resultadoForm = this.fb.group({
    golesLocal: [0, [Validators.required, Validators.min(0)]],
    golesVisita: [0, [Validators.required, Validators.min(0)]],
    finalizado: [false, [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private svc: CompetenciasService,
    private equiposSvc: EquiposService
  ) {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = '';

    // Primero equipos (para selects)
    this.equiposSvc.list().subscribe({
      next: (eqs) => (this.equipos = eqs),
      error: () => (this.error = 'No se pudieron cargar equipos (¿token?).'),
      complete: () => {
        // Luego competencias
        this.svc.list().subscribe({
          next: (data) => (this.competencias = data),
          error: () => (this.error = 'No se pudieron cargar competencias (¿token?).'),
          complete: () => (this.loading = false),
        });
      }
    });
  }

  // Helpers fecha
  toDatetimeLocal(iso: string): string {
    // "2025-12-26T18:56:11.140Z" -> "2025-12-26T12:56" (depende zona)
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  fromDatetimeLocalToIso(dtLocal: string): string {
    // "2025-12-26T18:56" -> ISO
    const d = new Date(dtLocal);
    return d.toISOString();
  }

  fmt(iso: string): string {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  }

  // MODALS
  openCreate() {
    this.selected = null;
    this.agendaForm.reset({
      fecha: '',
      lugar: '',
      equipoLocalId: null as any,
      equipoVisitaId: null as any,
    });
    this.modal = 'create';
  }

  openEditAgenda(c: Competencia) {
    this.selected = c;
    this.agendaForm.reset({
      fecha: this.toDatetimeLocal(c.fecha),
      lugar: c.lugar,
      equipoLocalId: c.equipoLocalId,
      equipoVisitaId: c.equipoVisitaId,
    });
    this.modal = 'editAgenda';
  }

  openResultado(c: Competencia) {
    this.selected = c;
    this.resultadoForm.reset({
      golesLocal: c.golesLocal ?? 0,
      golesVisita: c.golesVisita ?? 0,
      finalizado: !!c.finalizado,
    });
    this.modal = 'resultado';
  }

  openDelete(c: Competencia) {
    this.selected = c;
    this.modal = 'confirmDelete';
  }

  closeModal() {
    if (this.saving) return;
    this.modal = 'none';
    this.selected = null;
  }

  // ACTIONS
  saveCreate() {
    this.error = '';
    if (this.agendaForm.invalid) { this.agendaForm.markAllAsTouched(); return; }

    const raw = this.agendaForm.value;
    const body: CompetenciaAgendaRequest = {
      fecha: this.fromDatetimeLocalToIso(raw.fecha!),
      lugar: raw.lugar!,
      equipoLocalId: Number(raw.equipoLocalId),
      equipoVisitaId: Number(raw.equipoVisitaId),
    };

    // evitar local==visita
    if (body.equipoLocalId === body.equipoVisitaId) {
      this.error = 'El equipo local y visita no pueden ser el mismo.';
      return;
    }

    this.saving = true;
    this.svc.create(body).subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo crear la competencia.'; },
      complete: () => (this.saving = false),
    });
  }

  saveEditAgenda() {
    this.error = '';
    if (!this.selected) return;
    if (this.agendaForm.invalid) { this.agendaForm.markAllAsTouched(); return; }

    const raw = this.agendaForm.value;
    const body: CompetenciaAgendaRequest = {
      fecha: this.fromDatetimeLocalToIso(raw.fecha!),
      lugar: raw.lugar!,
      equipoLocalId: Number(raw.equipoLocalId),
      equipoVisitaId: Number(raw.equipoVisitaId),
    };

    if (body.equipoLocalId === body.equipoVisitaId) {
      this.error = 'El equipo local y visita no pueden ser el mismo.';
      return;
    }

    this.saving = true;
    this.svc.updateAgenda(this.selected.id, body).subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo actualizar la agenda.'; },
      complete: () => (this.saving = false),
    });
  }

  saveResultado() {
    this.error = '';
    if (!this.selected) return;
    if (this.resultadoForm.invalid) { this.resultadoForm.markAllAsTouched(); return; }

    const raw = this.resultadoForm.value;
    const body: CompetenciaResultadoRequest = {
      golesLocal: Number(raw.golesLocal),
      golesVisita: Number(raw.golesVisita),
      finalizado: !!raw.finalizado,
    };

    this.saving = true;
    this.svc.updateResultado(this.selected.id, body).subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo guardar el resultado.'; },
      complete: () => (this.saving = false),
    });
  }

  doDelete() {
    this.error = '';
    if (!this.selected) return;

    this.saving = true;
    this.svc.delete(this.selected.id).subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo eliminar.'; },
      complete: () => (this.saving = false),
    });
  }

  teamNameById(id: number): string {
    return this.equipos.find(e => e.id === id)?.nombre || `#${id}`;
  }
}
