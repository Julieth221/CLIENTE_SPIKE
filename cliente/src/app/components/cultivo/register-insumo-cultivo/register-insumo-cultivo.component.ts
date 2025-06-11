import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { MatDialog } from '@angular/material/dialog';
import { RegistroExitosoDialogComponent } from './registro-exitoso-dialog.component';

interface RegistroCultivo {
  Id: number;
  Nombre: string;
  FechaSiembra: string;
  Activo: boolean;
}

interface TipoInsumo {
  Id: number;
  Nombre: string;
}

interface CategoriaInsumo {
  Id: number;
  Nombre: string;
}

interface MetodoAplicacion {
  Id: number;
  Nombre: string;
}

@Component({
  selector: 'app-register-insumo-cultivo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './register-insumo-cultivo.component.html',
  styleUrl: './register-insumo-cultivo.component.css'
})
export class RegisterInsumoCultivoComponent implements OnInit {
  insumoForm: FormGroup;
  cultivos: RegistroCultivo[] = [];
  tiposInsumo: TipoInsumo[] = [];
  categoriasInsumo: CategoriaInsumo[] = [];
  metodosAplicacion: MetodoAplicacion[] = [];
  loading: boolean = false;
  user_id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.insumoForm = this.fb.group({
      cultivo: ['', Validators.required],
      fechaAplicacion: ['', Validators.required],
      tipoInsumo: ['', Validators.required],
      nuevoTipoInsumo: [''],
      categoriaInsumo: ['', Validators.required],
      nuevaCategoriaInsumo: [''],
      nombreInsumo: ['', Validators.required],
      cantidadAplicada: ['', [Validators.required, Validators.min(0)]],
      metodoAplicacion: ['', Validators.required],
      nuevoMetodoAplicacion: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    if (this.user_id) {
      this.cargarCultivos();
      this.cargarTiposInsumo();
      this.cargarCategoriasInsumo();
      this.cargarMetodosAplicacion();
    }
  }

  cargarCultivos(): void {
    this.loading = true;
    this.apiService.get<any>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Registro_Cultivo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response) => {
        this.cultivos = response.Data.filter((cultivo: RegistroCultivo) => cultivo.Activo);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.snackBar.open('Error al cargar los cultivos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cargarTiposInsumo(): void {
    this.apiService.get<any>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/tipo_insumo`).subscribe({
      next: (response) => {
        this.tiposInsumo = response.Data;
      },
      error: (error) => {
        console.error('Error al cargar tipos de insumo:', error);
        this.snackBar.open('Error al cargar los tipos de insumo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarCategoriasInsumo(): void {
    this.apiService.get<any>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/categoria_insumo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response) => {
        this.categoriasInsumo = response.Data;
      },
      error: (error) => {
        console.error('Error al cargar categorías de insumo:', error);
        this.snackBar.open('Error al cargar las categorías de insumo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarMetodosAplicacion(): void {
    this.apiService.get<any>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_aplicacion_insumo`).subscribe({
      next: (response) => {
        this.metodosAplicacion = response.Data;
      },
      error: (error) => {
        console.error('Error al cargar métodos de aplicación:', error);
        this.snackBar.open('Error al cargar los métodos de aplicación', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.insumoForm.valid) {
      const formData = this.insumoForm.value;
      const payload = {
        FkRegistroCultivo: formData.cultivo,
        FkTipoInsumo: formData.tipoInsumo === 'otro' ? '' : formData.tipoInsumo,
        NuevoTipoInsumo: formData.tipoInsumo === 'otro' ? formData.nuevoTipoInsumo : '',
        FkCategoriaInsumo: formData.categoriaInsumo === 'otra' ? '' : formData.categoriaInsumo,
        NuevaCategoriaInsumo: formData.categoriaInsumo === 'otra' ? formData.nuevaCategoriaInsumo : '',
        FkMetodoAplicacionInsumo: formData.metodoAplicacion === 'otro' ? '' : formData.metodoAplicacion,
        NuevoMetodoAplicacionInsumo: formData.metodoAplicacion === 'otro' ? formData.nuevoMetodoAplicacion : '',
        NombreInsumo: formData.nombreInsumo,
        FechaAplicacion: formData.fechaAplicacion,
        CantidadAplicada: formData.cantidadAplicada,
        Observaciones: formData.observaciones
      };

      this.loading = true;
      this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/gestion_insumo_cultivo`, payload).subscribe({
        next: (response) => {
          this.loading = false;
          this.insumoForm.reset();
          const dialogRef = this.dialog.open(RegistroExitosoDialogComponent, {
            width: '320px',
            disableClose: true
          });
          setTimeout(() => {
            dialogRef.close();
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error al registrar insumo:', error);
          this.snackBar.open('Error al registrar el insumo', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
