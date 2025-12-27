import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntrenadoresService, Entrenador, EntrenadorRequest } from '../../../core/services/entrenadores.service';

type ModalType = 'none' | 'create' | 'edit' | 'confirmDelete';

@Component({
  selector: 'app-entrenadores-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './entrenadores-list.component.html',
  styleUrl: './entrenadores-list.component.css',
})
export class EntrenadoresListComponent {
  loading = true;
  saving = false;
  error = '';

  entrenadores: Entrenador[] = [];
  modal: ModalType = 'none';
  selected: Entrenador | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    experienciaAnios: [0, [Validators.required, Validators.min(0)]],
    especialidad: ['', [Validators.required, Validators.minLength(2)]],
  });

  constructor(private fb: FormBuilder, private svc: EntrenadoresService) {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.list().subscribe({
      next: (data) => (this.entrenadores = data),
      error: () => (this.error = 'No se pudieron cargar entrenadores (JWT requerido).'),
      complete: () => (this.loading = false),
    });
  }

  openCreate() {
    this.selected = null;
    this.form.reset({ nombre:'', experienciaAnios:0, especialidad:'' });
    this.modal = 'create';
  }

  openEdit(t: Entrenador) {
    this.selected = t;
    this.form.reset({
      nombre: t.nombre,
      experienciaAnios: t.experienciaAnios,
      especialidad: t.especialidad,
    });
    this.modal = 'edit';
  }

  openDelete(t: Entrenador) {
    this.selected = t;
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

    const body: EntrenadorRequest = {
      nombre: this.form.value.nombre!,
      experienciaAnios: Number(this.form.value.experienciaAnios),
      especialidad: this.form.value.especialidad!,
    };

    this.saving = true;

    const req$ = (this.modal === 'edit' && this.selected)
      ? this.svc.update(this.selected.id, body)
      : this.svc.create(body);

    req$.subscribe({
      next: () => { this.closeModal(); this.load(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo guardar.'; },
      complete: () => (this.saving = false),
    });
  }

  doDelete() {
    if (!this.selected) return;
    this.saving = true;
    this.svc.delete(this.selected.id).subscribe({
      next: () => { this.closeModal(); this.load(); },
      error: (err) => { this.error = err?.error?.message || 'No se pudo eliminar.'; },
      complete: () => (this.saving = false),
    });
  }
}
