import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { EquiposService, Equipo, EquipoRequest } from '../../../core/services/equipos.service';
import { LigasService, Liga } from '../../../core/services/ligas.service';
import { EntrenadoresService, Entrenador } from '../../../core/services/entrenadores.service';

type ModalType = 'none' | 'create' | 'edit' | 'confirmDelete' | 'assignCoach';

@Component({
  selector: 'app-equipos-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './equipos-list.component.html',
  styleUrl: './equipos-list.component.css',
})
export class EquiposListComponent {
  loading = true;
  saving = false;
  error = '';

  equipos: Equipo[] = [];
  ligas: Liga[] = [];
  entrenadores: Entrenador[] = [];

  modal: ModalType = 'none';
  selected: Equipo | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apodo: ['', [Validators.required, Validators.minLength(2)]],
    ligaId: [null as number | null, [Validators.required]],
  });

  coachForm = this.fb.group({
    entrenadorId: [null as number | null, [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private equiposSvc: EquiposService,
    private ligasSvc: LigasService,
    private entrenadoresSvc: EntrenadoresService
  ) {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = '';

    // ligas son públicas
    this.ligasSvc.listPublic().subscribe({
      next: (data) => (this.ligas = data),
      error: () => (this.error = 'No se pudieron cargar ligas (público).'),
    });

    // entrenadores y equipos requieren JWT (tu interceptor lo mete)
    this.entrenadoresSvc.list().subscribe({
      next: (data) => (this.entrenadores = data),
      error: () => {},
    });

    this.equiposSvc.list().subscribe({
      next: (data) => (this.equipos = data),
      error: () => (this.error = 'No se pudieron cargar equipos (JWT requerido).'),
      complete: () => (this.loading = false),
    });
  }

  openCreate() {
    this.selected = null;
    const firstLiga = this.ligas?.[0]?.id ?? null;
    this.form.reset({ nombre: '', apodo: '', ligaId: firstLiga });
    this.modal = 'create';
  }

  openEdit(e: Equipo) {
    this.selected = e;
    this.form.reset({
      nombre: e.nombre,
      apodo: e.apodo,
      ligaId: e.ligaId,
    });
    this.modal = 'edit';
  }

  openDelete(e: Equipo) {
    this.selected = e;
    this.modal = 'confirmDelete';
  }

  openAssignCoach(e: Equipo) {
    this.selected = e;
    this.coachForm.reset({ entrenadorId: e.entrenadorId ?? null });
    this.modal = 'assignCoach';
  }

  closeModal() {
    if (this.saving) return;
    this.modal = 'none';
    this.selected = null;
  }

  save() {
    this.error = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const body: EquipoRequest = {
      nombre: this.form.value.nombre!,
      apodo: this.form.value.apodo!,
      ligaId: Number(this.form.value.ligaId),
    };

    this.saving = true;

    const req$ = (this.modal === 'edit' && this.selected)
      ? this.equiposSvc.update(this.selected.id, body)
      : this.equiposSvc.create(body);

    req$.subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo guardar equipo.'; },
      complete: () => (this.saving = false),
    });
  }

  doDelete() {
    if (!this.selected) return;
    this.saving = true;

    this.equiposSvc.delete(this.selected.id).subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo eliminar.'; },
      complete: () => (this.saving = false),
    });
  }

  saveCoach() {
    this.error = '';
    if (!this.selected) return;
    if (this.coachForm.invalid) { this.coachForm.markAllAsTouched(); return; }

    const entrenadorId = Number(this.coachForm.value.entrenadorId);

    this.saving = true;
    this.equiposSvc.asignarEntrenador(this.selected.id, entrenadorId).subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo asignar entrenador.'; },
      complete: () => (this.saving = false),
    });
  }

  quitarCoach(e: Equipo) {
    this.error = '';
    this.saving = true;
    this.equiposSvc.quitarEntrenador(e.id).subscribe({
      next: () => this.loadAll(),
      error: (err) => { this.error = err?.error?.message || 'No se pudo quitar entrenador.'; },
      complete: () => (this.saving = false),
    });
  }
}
