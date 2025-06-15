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
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { AuthService } from '../../../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { ModalInfoComponent } from './modal-info/modal-info.component';

interface Arrendatario {
  Id?: number;
  Nombre: string;
  Contacto: string;
  Id_Usuario?: number;
  TipoDocumento?: number;
  NumeroDocumento?: string;
  descripcionTipoDocumento?: string;
}

interface TipoDocumento {
  Id: number;
  Descripcion: string;
}

interface ApiResponse<T> {
  Data: T[];
}

interface TipoDocumentoResponse {
  Id: number;
  Descripcion: string;
}

interface Arrendamiento {
  Id: number;
  IdUserUserArrendatario: {
    Id: number;
  };
  Activo: boolean;
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
    MatDividerModule,
    MatSelectModule
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
  tiposDocumento = ['Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte', 'Tarjeta de identidad', 'Otro'];
  esOtroTipoDocumento = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.arrendatarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      contacto: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      tipoDocumentoSeleccionado: ['', Validators.required],
      otroTipoDocumento: [''],
      numeroDocumento: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z-]+$/)]]
    });

    // Suscribirse a cambios en tipoDocumentoSeleccionado
    this.arrendatarioForm.get('tipoDocumentoSeleccionado')?.valueChanges.subscribe(value => {
      this.esOtroTipoDocumento = value === 'Otro';
      if (value !== 'Otro') {
        this.arrendatarioForm.get('otroTipoDocumento')?.setValue('');
      }
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

  async obtenerTipoDocumentoId(descripcion: string): Promise<number> {
    try {
      const query = `?query=Descripcion:${encodeURIComponent(descripcion)}`;
      const resultado = await firstValueFrom(
        this.apiService.get<ApiResponse<TipoDocumentoResponse>>(`${API_URLS.CRUD.API_CRUD_USUARIO}/tipo_documento${query}`)
      );

      if (resultado?.Data?.length > 0) {
        return resultado.Data[0].Id;
      } else {
        const nuevo = await firstValueFrom(
          this.apiService.post<{ Data: TipoDocumentoResponse }>(`${API_URLS.CRUD.API_CRUD_USUARIO}/tipo_documento`, {
            Descripcion: descripcion
          })
        );
        return nuevo?.Data?.Id;
      }
    } catch (error) {
      console.error('Error al obtener/crear tipo de documento:', error);
      throw error;
    }
  }

  async cargarArrendatarios(): Promise<void> {
    if (!this.user_id) return;
    this.loading = true;
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario?query=Id_Usuario:${this.user_id}`).subscribe({
      next: async (response: any) => {
        this.arrendatarios = response;
        // Cargar descripciones de tipos de documento
        for (const arrendatario of this.arrendatarios) {
          if (arrendatario.TipoDocumento) {
            try {
              const descripcion = await this.obtenerDescripcionTipoDocumento(arrendatario.TipoDocumento);
              arrendatario.descripcionTipoDocumento = descripcion;
            } catch (error) {
              console.error('Error al obtener descripción del tipo de documento:', error);
              arrendatario.descripcionTipoDocumento = 'Tipo de documento no disponible';
            }
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar arrendatarios:', error);
        this.snackBar.open('Error al cargar los arrendatarios', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  async obtenerDescripcionTipoDocumento(id: number): Promise<string> {
    try {
      const query = `?query=Id:${id}`;
      const resultado = await firstValueFrom(
        this.apiService.get<ApiResponse<TipoDocumentoResponse>>(`${API_URLS.CRUD.API_CRUD_USUARIO}/tipo_documento${query}`)
      );

      if (resultado?.Data?.length > 0) {
        return resultado.Data[0].Descripcion;
      }
      return 'Tipo de documento no encontrado';
    } catch (error) {
      console.error('Error al obtener descripción del tipo de documento:', error);
      throw error;
    }
  }

  existeArrendatario(nombre: string, contacto: string, numeroDocumento: string): boolean {
    return this.arrendatarios.some(arr =>
      arr.Contacto.trim() === contacto ||
      arr.NumeroDocumento?.trim() === numeroDocumento ||
      (arr.Nombre.trim().toLowerCase() === nombre.toLowerCase() && arr.Contacto.trim() === contacto)
    );
  }

  async guardarArrendatario(): Promise<void> {
    if (this.arrendatarioForm.invalid) {
      this.arrendatarioForm.markAllAsTouched();
      return;
    }

    const formValue = this.arrendatarioForm.value;
    const nombre = formValue.nombre.trim().toLowerCase();
    const contacto = formValue.contacto.trim();
    const numeroDocumento = formValue.numeroDocumento.trim();

    if (!this.editing && this.existeArrendatario(nombre, contacto, numeroDocumento)) {
      this.snackBar.open('Ya existe un arrendatario con ese contacto, número de documento o combinación nombre-contacto.', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      this.loading = true;
      const descripcionTipoDocumento = this.esOtroTipoDocumento
        ? formValue.otroTipoDocumento
        : formValue.tipoDocumentoSeleccionado;

      const tipoDocumentoId = await this.obtenerTipoDocumentoId(descripcionTipoDocumento);

      const nuevoArrendatario: Arrendatario = {
        Nombre: nombre,
        Contacto: contacto,
        Id_Usuario: this.user_id ?? undefined,
        TipoDocumento: tipoDocumentoId,
        NumeroDocumento: numeroDocumento
      };

      if (this.editing && this.currentArrendatarioId) {
        await firstValueFrom(
          this.apiService.put(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario/${this.currentArrendatarioId}`, nuevoArrendatario)
        );
        this.snackBar.open('Arrendatario actualizado correctamente', 'Cerrar', { duration: 3000 });
      } else {
        await firstValueFrom(
          this.apiService.post(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario`, nuevoArrendatario)
        );
        this.snackBar.open('Arrendatario registrado correctamente', 'Cerrar', { duration: 3000 });
      }

      this.resetForm();
      this.cargarArrendatarios();
    } catch (error) {
      console.error('Error al guardar arrendatario:', error);
      this.snackBar.open('Error al guardar el arrendatario', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  editarArrendatario(arrendatario: Arrendatario): void {
    this.editing = true;
    this.currentArrendatarioId = arrendatario.Id ?? null;
    this.arrendatarioForm.patchValue({
      nombre: arrendatario.Nombre,
      contacto: arrendatario.Contacto,
      numeroDocumento: arrendatario.NumeroDocumento
    });
  }

  async verificarArrendatarioEnUso(arrendatarioId: number): Promise<boolean> {
    try {
      const query = `?query=IdUserUserArrendatario.Id:${arrendatarioId}`;
      const resultado = await firstValueFrom(
        this.apiService.get<ApiResponse<Arrendamiento>>(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento${query}`)
      );
      return resultado?.Data?.length > 0;
    } catch (error) {
      console.error('Error al verificar arrendatario en uso:', error);
      throw error;
    }
  }

  async eliminarArrendatario(arrendatario: Arrendatario): Promise<void> {
    if (!arrendatario.Id) {
      this.dialog.open(ModalInfoComponent, {
        data: {
          title: 'Error',
          message: 'ID del arrendatario no disponible',
          type: 'error'
        }
      });
      return;
    }

    try {
      // Primero verificamos si el arrendatario tiene arrendamientos activos
      const query = `?query=IdUserUserArrendatario.Id:${arrendatario.Id}`;
      const resultado = await firstValueFrom(
        this.apiService.get<Arrendamiento[]>(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento${query}`)
      );

      // Verificamos si hay algún arrendamiento activo
      const tieneArrendamientoActivo = resultado?.some(arrendamiento => arrendamiento.Activo === true);

      if (tieneArrendamientoActivo) {
        this.dialog.open(ModalInfoComponent, {
          data: {
            title: 'No se puede eliminar',
            message: 'Este arrendatario no puede ser eliminado porque está vinculado a uno o más arrendamientos activos. Por razones de trazabilidad, los arrendatarios con arrendamientos activos deben mantenerse en el sistema.',
            type: 'warning'
          }
        });
        return;
      }

      // Si no tiene arrendamientos activos, procedemos con la eliminación
      if (confirm(`¿Está seguro de eliminar al arrendatario "${arrendatario.Nombre}"?`)) {
        this.loading = true;
        try {
          await firstValueFrom(
            this.apiService.delete(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario/${arrendatario.Id}`)
          );
          this.snackBar.open('Arrendatario eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarArrendatarios();
        } catch {
          this.dialog.open(ModalInfoComponent, {
            data: {
              title: 'Error',
              message: 'Ha ocurrido un error al intentar eliminar el arrendatario. Por favor, intente nuevamente.',
              type: 'error'
            }
          });
        } finally {
          this.loading = false;
        }
      }
    } catch {
      this.dialog.open(ModalInfoComponent, {
        data: {
          title: 'Error',
          message: 'Ha ocurrido un error al verificar el estado del arrendatario. Por favor, intente nuevamente.',
          type: 'error'
        }
      });
    }
  }

  resetForm(): void {
    this.arrendatarioForm.reset();
    this.editing = false;
    this.currentArrendatarioId = null;
    this.loading = false;
    this.esOtroTipoDocumento = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }

  formatPhoneNumber(phone: string): string {
    return phone.length === 10 ? `${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6)}` : phone;
  }
}
