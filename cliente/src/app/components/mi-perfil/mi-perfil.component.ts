import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { API_URLS } from '../../../config/api_config';

@Component({
  selector: 'app-mi-perfil',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit {
  perfilForm: FormGroup;
  loading: boolean = false;
  formChanged: boolean = false;
  originalFormValues: any;
  userId: number = 0;
  fkCredencial: number | null = null;
  idTipoDocumento: number | null = null;
  numDocumento: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.perfilForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      contacto: ['', [Validators.required, Validators.minLength(7)]],
      correo: ['', [Validators.required, Validators.email]],
      tipoDocumento: [{value: '', disabled: true}],
      numeroDocumento: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.userId = this.authService.getIdFromToken();
    console.log('ID del usuario autenticado:', this.userId);
    this.cargarDatosUsuario();
    this.originalFormValues = this.perfilForm.value;
    this.perfilForm.valueChanges.subscribe(() => {
      this.formChanged = JSON.stringify(this.perfilForm.value) !== JSON.stringify(this.originalFormValues);
    });
  }

  cargarDatosUsuario(): void {
    this.loading = true;
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_USUARIO}/Usuario/${this.userId}`).subscribe({
      next: (response: any) => {
        if (response && response.Data) {
          const usuario = response.Data;
          this.fkCredencial = usuario.FkCredencial?.Id || null;
          this.idTipoDocumento = usuario.TipoDocumento?.Id || null;
          this.numDocumento = usuario.NumeroDocumento
          this.perfilForm.patchValue({
            nombres: usuario.Nombre,
            apellidos: usuario.Apellido,
            contacto: usuario.Contacto,
            correo: usuario.CorreoElectronico,
            tipoDocumento: usuario.TipoDocumento?.Descripcion,
            numeroDocumento: usuario.NumeroDocumento
          });
          this.originalFormValues = this.perfilForm.value;
          this.formChanged = false;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        this.mostrarMensaje('Error al cargar los datos del usuario', 'error');
        this.loading = false;
      }
    });
  }

  guardarCambios(): void {
    if (this.perfilForm.invalid) {
      this.mostrarMensaje('Por favor, complete todos los campos requeridos', 'error');
      return;
    }

    this.loading = true;
    const datosActualizados = {
      Id: this.userId,
      Nombre: this.perfilForm.get('nombres')?.value,
      Apellido: this.perfilForm.get('apellidos')?.value,
      Contacto: this.perfilForm.get('contacto')?.value,
      CorreoElectronico: this.perfilForm.get('correo')?.value,
      TipoDocumento: this.idTipoDocumento ? {Id: this.idTipoDocumento}: null,
      NumeroDocumento: this.numDocumento,
      Activo: true,
      FkCredencial: this.fkCredencial ? { Id: this.fkCredencial } : null
    };

    console.log("este es el body para actualizar ", datosActualizados);

    this.apiService.put(`${API_URLS.CRUD.API_CRUD_USUARIO}/Usuario/${this.userId}`, datosActualizados).subscribe({
      next: () => {
        this.mostrarMensaje('Perfil actualizado exitosamente', 'success');
        this.originalFormValues = this.perfilForm.value;
        this.formChanged = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.mostrarMensaje('Error al actualizar el perfil', 'error');
        this.loading = false;
      }
    });
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: tipo === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
