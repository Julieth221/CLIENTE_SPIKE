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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { ArrendatarioRegisterComponent } from '../arrendatario-register/arrendatario-register.component';


interface TipoSuelo {
  Id?: number;
  Nombre: string;
  id_usuario?: number;
}

@Component({
  selector: 'app-register-tipo-suelo',
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
    MatDividerModule,
    MatButtonToggleModule,
    ArrendatarioRegisterComponent
  ],
  templateUrl: './register-tipo-suelo.component.html',
  styleUrl: './register-tipo-suelo.component.css'
})
export class RegisterTipoSueloComponent implements OnInit {
  tipoSueloForm: FormGroup;
  tiposSuelo: TipoSuelo[] = [];
  loading: boolean = false;
  editing: boolean = false;
  currentTipoSueloId: number | null = null;
  user_id: number | null = null;
  
  // Control de vista
  vistaActual: 'tipoSuelo' | 'arrendatario' = 'tipoSuelo';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.tipoSueloForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Obtenemos el ID del usuario del token JWT
    this.user_id = this.authService.getUserId();
    console.log(this.user_id)
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      console.log('no se encontro informacion del usuario')
      // this.router.navigate(['/login']);
      return;
    }
    
    this.cargarTiposSuelo();
  }

  cargarTiposSuelo(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    // Añadimos el id_usuario como parámetro de consulta para filtrar por usuario
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/tipo_suelo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.tiposSuelo = response.Data; // Aquí está el array correcto
        this.loading = false;
        console.log(typeof this.tiposSuelo, this.tiposSuelo);
      },
      
      error: (error) => {
        console.error('Error al cargar tipos de suelo:', error);
        this.snackBar.open('Error al cargar los tipos de suelo', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  guardarTipoSuelo(): void {
    
    if (this.tipoSueloForm.invalid || !this.user_id) {
      this.tipoSueloForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const tipoSueloData: TipoSuelo = {
      Nombre: this.tipoSueloForm.value.nombre.toLowerCase().trim(),
      id_usuario: this.user_id // Incluimos el ID del usuario autenticado
    };
    

    // Verificar si ya existe un tipo de suelo con el mismo nombre para este usuario
    const tipoSueloExistente = this.tiposSuelo.find(
      tipo => tipo.Nombre.toLowerCase() === tipoSueloData.Nombre
    );

    if (tipoSueloExistente && !this.editing) {
      this.snackBar.open('Este tipo de suelo ya está registrado', 'Cerrar', { duration: 3000 });
      this.loading = false;
      return;
    }

    if (this.editing && this.currentTipoSueloId) {
      console.log(tipoSueloData)
      // Actualizar tipo de suelo existente
      this.apiService.put(
        `${API_URLS.CRUD.API_CRUD_FINCA}/tipo_suelo/${this.currentTipoSueloId}`, 
        tipoSueloData
      ).subscribe({
        next: () => {
          this.snackBar.open('Tipo de suelo actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarTiposSuelo();
        },
        error: (error) => {
          console.error('Error al actualizar tipo de suelo:', error);
          this.snackBar.open('Error al actualizar el tipo de suelo', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      console.log(tipoSueloData)
      // Crear nuevo tipo de suelo
      this.apiService.post(
        `${API_URLS.CRUD.API_CRUD_FINCA}/tipo_suelo`, 
        tipoSueloData
      ).subscribe({
        next: (response) => {
          console.log('Finca registrada con éxito:', response);
          this.snackBar.open('Tipo de suelo registrado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarTiposSuelo();
        },
        error: (error) => {
          console.error('Error al registrar tipo de suelo:', error);
          this.snackBar.open('Error al registrar el tipo de suelo', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editarTipoSuelo(tipoSuelo: TipoSuelo): void {
    this.editing = true;
    this.currentTipoSueloId = tipoSuelo.Id ?? null;
    this.tipoSueloForm.patchValue({
      nombre: tipoSuelo.Nombre
    });
  }
  

  eliminarTipoSuelo(tipoSuelo: TipoSuelo): void {
    
    if (!tipoSuelo.Id) {
      this.snackBar.open('Error: ID del tipo de suelo no disponible', 'Cerrar', { duration: 3000 });
      console.log('Eliminando tipo de suelo con ID:', tipoSuelo.Id);

      return;
    }

    if (confirm(`¿Está seguro de eliminar el tipo de suelo "${tipoSuelo.Nombre}"?`)) {
      this.loading = true;
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_FINCA}/tipo_suelo/${tipoSuelo.Id}`).subscribe({
        next: () => {
          this.snackBar.open('Tipo de suelo eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarTiposSuelo();
        },
        error: (error) => {
          console.error('Error al eliminar tipo de suelo:', error);
          this.snackBar.open('Error al eliminar el tipo de suelo', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.tipoSueloForm.reset();
    this.editing = false;
    this.currentTipoSueloId = null;
    this.loading = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }

  getTipoSueloColor(tipo: string): string {
    const colors: { [key: string]: string } = {
      'limoso': '#8bc34a',  // Verde
      'arcilloso': '#ff9800', // Naranja
      'arenoso': '#ffc107',  // Amarillo
      'humífero': '#795548', // Marrón
      'calcáreo': '#e0e0e0', // Gris claro
      'aluvial': '#03a9f4'   // Azul claro
    };
    
    return colors[tipo.toLowerCase()] || '#9e9e9e'; // Gris por defecto
  }
}
