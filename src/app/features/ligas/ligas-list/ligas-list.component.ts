import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LigasService, Liga, LigaRequest } from '../../../core/services/ligas.service';

type ModalType = 'none' | 'create' | 'edit' | 'confirmDelete';

@Component({
  selector: 'app-ligas-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ligas-list.component.html',
  styleUrl: './ligas-list.component.css',
})
export class LigasListComponent {
  loading = true;
  saving = false;
  error = '';

  ligas: Liga[] = [];
  modal: ModalType = 'none';
  selected: Liga | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    categoria: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required, Validators.minLength(2)]],
  });

  constructor(private fb: FormBuilder, private svc: LigasService) {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.listPublic().subscribe({
      next: (data) => (this.ligas = data),
      error: () => (this.error = 'No se pudieron cargar ligas.'),
      complete: () => (this.loading = false),
    });
  }

  openCreate() {
    this.selected = null;
    this.form.reset({ nombre:'', categoria:'', descripcion:'' });
    this.modal = 'create';
  }

  openEdit(l: Liga) {
    this.selected = l;
    this.form.reset({
      nombre: l.nombre,
      categoria: l.categoria,
      descripcion: l.descripcion,
    });
    this.modal = 'edit';
  }

  openDelete(l: Liga) {
    this.selected = l;
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

    const body: LigaRequest = {
      nombre: this.form.value.nombre!,
      categoria: this.form.value.categoria!,
      descripcion: this.form.value.descripcion!,
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
