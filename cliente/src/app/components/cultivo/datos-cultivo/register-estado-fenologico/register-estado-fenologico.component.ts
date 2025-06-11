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

interface EstadoFenologico {
  Id?: number;
  Nombre: string;
  Activo?: boolean;
  Id_Usuario?: number;
}

@Component({
  selector: 'app-register-estado-fenologico',
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
  templateUrl: './register-estado-fenologico.component.html',
  styleUrl: './register-estado-fenologico.component.css' 
})
export class RegisterEstadoFenologicoComponent implements OnInit {
  estadoFenologicoForm: FormGroup;
  estadosFenologicos: EstadoFenologico[] = [];
  loading: boolean = false;
  editing: boolean = false;
  currentEstadoFenologicoId: number | null = null;
  user_id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.estadoFenologicoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.cargarEstadosFenologicos();
  }

  cargarEstadosFenologicos(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Estado_fenologico_cultivo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.estadosFenologicos = response.Data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estados fenológicos:', error);
        this.snackBar.open('Error al cargar los estados fenológicos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  guardarEstadoFenologico(): void {
    if (this.estadoFenologicoForm.invalid || !this.user_id) {
      this.estadoFenologicoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const estadoFenologicoData: EstadoFenologico = {
      Nombre: this.estadoFenologicoForm.value.nombre.toLowerCase().trim(),
      Id_Usuario: this.user_id,
      Activo: true
    };

    const estadoFenologicoExistente = this.estadosFenologicos.find(
      estado => estado.Nombre.toLowerCase() === estadoFenologicoData.Nombre
    );

    if (estadoFenologicoExistente && !this.editing) {
      this.snackBar.open('Este estado fenológico ya está registrado', 'Cerrar', { duration: 3000 });
      this.loading = false;
      return;
    }

    if (this.editing && this.currentEstadoFenologicoId) {
      this.apiService.put(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/Estado_fenologico_cultivo/${this.currentEstadoFenologicoId}`,
        estadoFenologicoData
      ).subscribe({
        next: () => {
          this.snackBar.open('Estado fenológico actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarEstadosFenologicos();
        },
        error: (error) => {
          console.error('Error al actualizar estado fenológico:', error);
          this.snackBar.open('Error al actualizar el estado fenológico', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.apiService.post(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/Estado_fenologico_cultivo`,
        estadoFenologicoData
      ).subscribe({
        next: () => {
          this.snackBar.open('Estado fenológico registrado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarEstadosFenologicos();
        },
        error: (error) => {
          console.error('Error al registrar estado fenológico:', error);
          this.snackBar.open('Error al registrar el estado fenológico', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editarEstadoFenologico(estadoFenologico: EstadoFenologico): void {
    this.editing = true;
    this.currentEstadoFenologicoId = estadoFenologico.Id ?? null;
    this.estadoFenologicoForm.patchValue({
      nombre: estadoFenologico.Nombre
    });
  }

  eliminarEstadoFenologico(estadoFenologico: EstadoFenologico): void {
    if (!estadoFenologico.Id) {
      this.snackBar.open('Error: ID del estado fenológico no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm(`¿Está seguro de eliminar el estado fenológico "${estadoFenologico.Nombre}"?`)) {
      this.loading = true;
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Estado_fenologico_cultivo/${estadoFenologico.Id}`).subscribe({
        next: () => {
          this.snackBar.open('Estado fenológico eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarEstadosFenologicos();
        },
        error: (error) => {
          console.error('Error al eliminar estado fenológico:', error);
          this.snackBar.open('Error al eliminar el estado fenológico', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.estadoFenologicoForm.reset();
    this.editing = false;
    this.currentEstadoFenologicoId = null;
    this.loading = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }
}
