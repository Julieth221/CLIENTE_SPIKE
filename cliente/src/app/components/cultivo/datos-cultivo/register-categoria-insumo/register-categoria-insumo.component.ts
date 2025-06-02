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

interface CategoriaInsumo {
  Id?: number;
  Nombre: string;
  Activo?: boolean;
  Id_Usuario?: number;
}

@Component({
  selector: 'app-register-categoria-insumo',
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
  templateUrl: './register-categoria-insumo.component.html',
  styleUrl: './register-categoria-insumo.component.css'
})
export class RegisterCategoriaInsumoComponent implements OnInit {
  categoriaInsumoForm: FormGroup;
  categoriasInsumo: CategoriaInsumo[] = [];
  loading: boolean = false;
  editing: boolean = false;
  currentCategoriaInsumoId: number | null = null;
  user_id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.categoriaInsumoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.cargarCategoriasInsumo();
  }

  cargarCategoriasInsumo(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/categoria_insumo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.categoriasInsumo = response.Data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías de insumo:', error);
        this.snackBar.open('Error al cargar las categorías de insumo', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  guardarCategoriaInsumo(): void {
    if (this.categoriaInsumoForm.invalid || !this.user_id) {
      this.categoriaInsumoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const categoriaInsumoData: CategoriaInsumo = {
      Nombre: this.categoriaInsumoForm.value.nombre.toLowerCase().trim(),
      Id_Usuario: this.user_id,
      Activo: true
    };

    const categoriaInsumoExistente = this.categoriasInsumo.find(
      categoria => categoria.Nombre.toLowerCase() === categoriaInsumoData.Nombre
    );

    if (categoriaInsumoExistente && !this.editing) {
      this.snackBar.open('Esta categoría de insumo ya está registrada', 'Cerrar', { duration: 3000 });
      this.loading = false;
      return;
    }

    if (this.editing && this.currentCategoriaInsumoId) {
      console.log("actualizar", categoriaInsumoData);
      this.apiService.put(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/categoria_insumo/${this.currentCategoriaInsumoId}`,
        categoriaInsumoData
      ).subscribe({
        next: () => {
          this.snackBar.open('Categoría de insumo actualizada correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarCategoriasInsumo();
        },
        error: (error) => {
          console.error('Error al actualizar categoría de insumo:', error);
          this.snackBar.open('Error al actualizar la categoría de insumo', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      console.log("crear",categoriaInsumoData);
      this.apiService.post(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/categoria_insumo`,
        categoriaInsumoData
      ).subscribe({
        next: () => {
          this.snackBar.open('Categoría de insumo registrada correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarCategoriasInsumo();
        },
        error: (error) => {
          console.error('Error al registrar categoría de insumo:', error);
          this.snackBar.open('Error al registrar la categoría de insumo', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editarCategoriaInsumo(categoriaInsumo: CategoriaInsumo): void {
    this.editing = true;
    this.currentCategoriaInsumoId = categoriaInsumo.Id ?? null;
    this.categoriaInsumoForm.patchValue({
      nombre: categoriaInsumo.Nombre
    });
  }

  eliminarCategoriaInsumo(categoriaInsumo: CategoriaInsumo): void {
    if (!categoriaInsumo.Id) {
      this.snackBar.open('Error: ID de la categoría de insumo no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm(`¿Está seguro de eliminar la categoría de insumo "${categoriaInsumo.Nombre}"?`)) {
      this.loading = true;
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_CULTIVO}/categoria_insumo/${categoriaInsumo.Id}`).subscribe({
        next: () => {
          this.snackBar.open('Categoría de insumo eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.cargarCategoriasInsumo();
        },
        error: (error) => {
          console.error('Error al eliminar categoría de insumo:', error);
          this.snackBar.open('Error al eliminar la categoría de insumo', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.categoriaInsumoForm.reset();
    this.editing = false;
    this.currentCategoriaInsumoId = null;
    this.loading = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }
}
