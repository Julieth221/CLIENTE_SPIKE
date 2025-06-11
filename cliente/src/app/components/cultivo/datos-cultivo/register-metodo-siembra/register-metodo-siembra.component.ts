import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../../../services/api.service';
import { AuthService } from '../../../../../services/auth.service';
import { API_URLS } from '../../../../../config/api_config';

interface MetodoSiembra {
  Id?: number;
  Nombre: string;
  Activo?: boolean;
  Id_Usuario?: number;
}

@Component({
  selector: 'app-register-metodo-siembra',
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
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './register-metodo-siembra.component.html',
  styleUrl: './register-metodo-siembra.component.css'
})
export class RegisterMetodoSiembraComponent implements OnInit {
  metodoSiembraForm: FormGroup;
  metodosSiembra: MetodoSiembra[] = [];
  loading: boolean = false;
  editing: boolean = false;
  currentMetodoSiembraId: number | null = null;
  user_id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.metodoSiembraForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.cargarMetodosSiembra();
  }

  cargarMetodosSiembra(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.metodosSiembra = response.Data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar métodos de siembra:', error);
        this.snackBar.open('Error al cargar los métodos de siembra', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  guardarMetodoSiembra(): void {
    if (this.metodoSiembraForm.invalid || !this.user_id) {
      this.metodoSiembraForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const metodoSiembraData: MetodoSiembra = {
      Nombre: this.metodoSiembraForm.value.nombre.toLowerCase().trim(),
      Id_Usuario: this.user_id,
      Activo: true
    };

    const metodoSiembraExistente = this.metodosSiembra.find(
      metodo => metodo.Nombre.toLowerCase() === metodoSiembraData.Nombre
    );

    if (metodoSiembraExistente && !this.editing) {
      this.snackBar.open('Este método de siembra ya está registrado', 'Cerrar', { duration: 3000 });
      this.loading = false;
      return;
    }

    if (this.editing && this.currentMetodoSiembraId) {
      this.apiService.put(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra/${this.currentMetodoSiembraId}`,
        metodoSiembraData
      ).subscribe({
        next: () => {
          this.snackBar.open('Método de siembra actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarMetodosSiembra();
        },
        error: (error) => {
          console.error('Error al actualizar método de siembra:', error);
          this.snackBar.open('Error al actualizar el método de siembra', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.apiService.post(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra`,
        metodoSiembraData
      ).subscribe({
        next: () => {
          this.snackBar.open('Método de siembra registrado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarMetodosSiembra();
        },
        error: (error) => {
          console.error('Error al registrar método de siembra:', error);
          this.snackBar.open('Error al registrar el método de siembra', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editarMetodoSiembra(metodoSiembra: MetodoSiembra): void {
    this.editing = true;
    this.currentMetodoSiembraId = metodoSiembra.Id ?? null;
    this.metodoSiembraForm.patchValue({
      nombre: metodoSiembra.Nombre
    });
  }

  eliminarMetodoSiembra(metodoSiembra: MetodoSiembra): void {
    if (!metodoSiembra.Id) {
      this.snackBar.open('Error: ID del método de siembra no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm(`¿Está seguro de eliminar el método de siembra "${metodoSiembra.Nombre}"?`)) {
      this.loading = true;
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra/${metodoSiembra.Id}`).subscribe({
        next: () => {
          this.snackBar.open('Método de siembra eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarMetodosSiembra();
        },
        error: (error) => {
          console.error('Error al eliminar método de siembra:', error);
          this.snackBar.open('Error al eliminar el método de siembra', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.metodoSiembraForm.reset();
    this.editing = false;
    this.currentMetodoSiembraId = null;
    this.loading = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }
}
