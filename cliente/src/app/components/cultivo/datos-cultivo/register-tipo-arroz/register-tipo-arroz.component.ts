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

interface TipoArroz {
  Id?: number;
  Nombre: string;
  Activo?: boolean;
  Id_Usuario?: number;
}

@Component({
  selector: 'app-register-tipo-arroz',
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
  templateUrl: './register-tipo-arroz.component.html',
  styleUrl: './register-tipo-arroz.component.css'
})
export class RegisterTipoArrozComponent implements OnInit {
  tipoArrozForm: FormGroup;
  tiposArroz: TipoArroz[] = [];
  loading: boolean = false;
  editing: boolean = false;
  currentTipoArrozId: number | null = null;
  user_id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.tipoArrozForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.cargarTiposArroz();
  }

  cargarTiposArroz(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/tipo_arroz?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.tiposArroz = response.Data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar tipos de arroz:', error);
        this.snackBar.open('Error al cargar los tipos de arroz', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  guardarTipoArroz(): void {
    if (this.tipoArrozForm.invalid || !this.user_id) {
      this.tipoArrozForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const tipoArrozData: TipoArroz = {
      Nombre: this.tipoArrozForm.value.nombre.toLowerCase().trim(),
      Id_Usuario: this.user_id,
      Activo: true
    };

    const tipoArrozExistente = this.tiposArroz.find(
      tipo => tipo.Nombre.toLowerCase() === tipoArrozData.Nombre
    );

    if (tipoArrozExistente && !this.editing) {
      this.snackBar.open('Este tipo de arroz ya está registrado', 'Cerrar', { duration: 3000 });
      this.loading = false;
      return;
    }

    if (this.editing && this.currentTipoArrozId) {
      this.apiService.put(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/tipo_arroz/${this.currentTipoArrozId}`,
        tipoArrozData
      ).subscribe({
        next: () => {
          this.snackBar.open('Tipo de arroz actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarTiposArroz();
        },
        error: (error) => {
          console.error('Error al actualizar tipo de arroz:', error);
          this.snackBar.open('Error al actualizar el tipo de arroz', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.apiService.post(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/tipo_arroz`,
        tipoArrozData
      ).subscribe({
        next: () => {
          this.snackBar.open('Tipo de arroz registrado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarTiposArroz();
        },
        error: (error) => {
          console.error('Error al registrar tipo de arroz:', error);
          this.snackBar.open('Error al registrar el tipo de arroz', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editarTipoArroz(tipoArroz: TipoArroz): void {
    this.editing = true;
    this.currentTipoArrozId = tipoArroz.Id ?? null;
    this.tipoArrozForm.patchValue({
      nombre: tipoArroz.Nombre
    });
  }

  eliminarTipoArroz(tipoArroz: TipoArroz): void {
    if (!tipoArroz.Id) {
      this.snackBar.open('Error: ID del tipo de arroz no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm(`¿Está seguro de eliminar el tipo de arroz "${tipoArroz.Nombre}"?`)) {
      this.loading = true;
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_CULTIVO}/tipo_arroz/${tipoArroz.Id}`).subscribe({
        next: () => {
          this.snackBar.open('Tipo de arroz eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarTiposArroz();
        },
        error: (error) => {
          console.error('Error al eliminar tipo de arroz:', error);
          this.snackBar.open('Error al eliminar el tipo de arroz', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.tipoArrozForm.reset();
    this.editing = false;
    this.currentTipoArrozId = null;
    this.loading = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }
}
