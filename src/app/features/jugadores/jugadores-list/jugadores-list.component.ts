import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { JugadoresService, Jugador, JugadorRequest } from '../../../core/services/jugadores.service';
import { EquiposService, Equipo } from '../../../core/services/equipos.service';

type ModalType = 'none' | 'create' | 'edit' | 'confirmDelete';

@Component({
  selector: 'app-jugadores-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './jugadores-list.component.html',
  styleUrl: './jugadores-list.component.css',
})
export class JugadoresListComponent {
  loading = true;
  saving = false;
  error = '';

  jugadores: Jugador[] = [];
  equipos: Equipo[] = [];

  modal: ModalType = 'none';
  selected: Jugador | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    posicion: ['', [Validators.required, Validators.minLength(2)]],
    numero: [1, [Validators.required, Validators.min(0)]],
    edad: [18, [Validators.required, Validators.min(0)]],
    equipoId: [null as number | null, [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private jugadoresSvc: JugadoresService,
    private equiposSvc: EquiposService
  ) {
    this.loadAll();
  }

  loadAll() {
    this.loading = true;
    this.error = '';

    // ambos requieren JWT (por tus capturas)
    this.equiposSvc.list().subscribe({
      next: (data) => (this.equipos = data),
      error: () => {},
    });

    this.jugadoresSvc.list().subscribe({
      next: (data) => (this.jugadores = data),
      error: () => (this.error = 'No se pudieron cargar jugadores (JWT requerido).'),
      complete: () => (this.loading = false),
    });
  }

  openCreate() {
    this.selected = null;
    const firstEquipo = this.equipos?.[0]?.id ?? null;
    this.form.reset({ nombre:'', posicion:'', numero:1, edad:18, equipoId:firstEquipo });
    this.modal = 'create';
  }

  openEdit(j: Jugador) {
    this.selected = j;
    this.form.reset({
      nombre: j.nombre,
      posicion: j.posicion,
      numero: j.numero,
      edad: j.edad,
      equipoId: j.equipoId,
    });
    this.modal = 'edit';
  }

  openDelete(j: Jugador) {
    this.selected = j;
    this.modal = 'confirmDelete';
  }

  closeModal() {
    if (this.saving) return;
    this.modal = 'none';
    this.selected = null;
  }

  save() {
    this.error = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const body: JugadorRequest = {
      nombre: this.form.value.nombre!,
      posicion: this.form.value.posicion!,
      numero: Number(this.form.value.numero),
      edad: Number(this.form.value.edad),
      equipoId: Number(this.form.value.equipoId),
    };

    this.saving = true;

    const req$ = (this.modal === 'edit' && this.selected)
      ? this.jugadoresSvc.update(this.selected.id, body)
      : this.jugadoresSvc.create(body);

    req$.subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo guardar.'; },
      complete: () => (this.saving = false),
    });
  }

  doDelete() {
    if (!this.selected) return;
    this.saving = true;
    this.jugadoresSvc.delete(this.selected.id).subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo eliminar.'; },
      complete: () => (this.saving = false),
    });
  }
}
