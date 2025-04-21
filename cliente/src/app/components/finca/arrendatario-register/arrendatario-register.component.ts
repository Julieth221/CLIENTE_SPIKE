import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { AuthService } from '../../../../services/auth.service';

interface Arrendatario {
  Id?: number;
  Nombre: string;
  Contacto: string;
  Id_Usuario?: number;
}

@Component({
  selector: 'app-arrendatario-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './arrendatario-register.component.html',
  styleUrl: './arrendatario-register.component.css'
})
export class ArrendatarioRegisterComponent implements OnInit {
  arrendatarioForm: FormGroup;
  arrendatarios: Arrendatario[] = [];
  loading = false;
  editing = false;
  currentArrendatarioId: number | null = null;
  user_id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.arrendatarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      contacto: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }
    this.cargarArrendatarios();
  }

  cargarArrendatarios(): void {
    if (!this.user_id) return;
    this.loading = true;
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.arrendatarios = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar arrendatarios:', error);
        this.snackBar.open('Error al cargar los arrendatarios', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  existeArrendatario(nombre: string, contacto: string): boolean {
    return this.arrendatarios.some(arr =>
      arr.Contacto.trim() === contacto ||
      (arr.Nombre.trim().toLowerCase() === nombre.toLowerCase() && arr.Contacto.trim() === contacto)
    );
  }

  guardarArrendatario(): void {
    if (this.arrendatarioForm.invalid) {
      this.arrendatarioForm.markAllAsTouched();
      return;
    }

    const nombre = this.arrendatarioForm.value.nombre.trim().toLowerCase();
    const contacto = this.arrendatarioForm.value.contacto.trim();

    const nuevoArrendatario: Arrendatario = {
      Nombre: nombre,
      Contacto: contacto,
      Id_Usuario: this.user_id ?? undefined
    };

    if (!this.editing && this.existeArrendatario(nombre, contacto)) {
      this.snackBar.open('Ya existe un arrendatario con ese contacto o combinación nombre-contacto.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.editing && this.currentArrendatarioId) {
      this.apiService.put(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario/${this.currentArrendatarioId}`, nuevoArrendatario).subscribe({
        next: () => {
          console.log("ID actual a editar:", this.currentArrendatarioId);
          console.log("arrendatario a editar:", nuevoArrendatario);
          this.snackBar.open('Arrendatario actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarArrendatarios();
        },
        error: (error) => {
          console.log("ID actual a editar:", this.currentArrendatarioId);
          console.log("arrendatario a editar:", nuevoArrendatario);
          console.error('Error al actualizar arrendatario:', error?.error || error);
          console.error('Error al actualizar arrendatario:', error);
          this.snackBar.open('Error al actualizar el arrendatario', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.apiService.post(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario`, nuevoArrendatario).subscribe({
        next: () => {
          this.snackBar.open('Arrendatario registrado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarArrendatarios();
        },
        error: (error) => {
          console.error('Error al registrar arrendatario:', error);
          this.snackBar.open('Error al registrar el arrendatario', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editarArrendatario(arrendatario: Arrendatario): void {
    this.editing = true;
    this.currentArrendatarioId = arrendatario.Id ?? null;
    this.arrendatarioForm.patchValue({
      nombre: arrendatario.Nombre,
      contacto: arrendatario.Contacto
    });
  }

  eliminarArrendatario(arrendatario: Arrendatario): void {
    if (!arrendatario.Id) {
      this.snackBar.open('Error: ID del arrendatario no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm(`¿Está seguro de eliminar al arrendatario "${arrendatario.Nombre}"?`)) {
      this.loading = true;
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario/${arrendatario.Id}`).subscribe({
        next: () => {
          this.snackBar.open('Arrendatario eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarArrendatarios();
        },
        error: (error) => {
          console.error('Error al actualizar arrendatario:', error?.error || error);
          console.error('Error al eliminar arrendatario:', error);
          this.snackBar.open('Error al eliminar el arrendatario', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.arrendatarioForm.reset();
    this.editing = false;
    this.currentArrendatarioId = null;
    this.loading = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }

  formatPhoneNumber(phone: string): string {
    return phone.length === 10 ? `${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6)}` : phone;
  }
}
