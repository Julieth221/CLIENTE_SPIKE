import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { forkJoin } from 'rxjs';

// Interfaces para manejar la estructura de datos
interface Parcela {
  Id: number;
  NombreParcela: string;
  TamañoParcela: number;
  FkFincaParcela: {
    Id: number;
  };
  arrendada?: boolean;
}

interface ArrendamientoRequest {
  FkArrendamientoFinca: { Id: number };
  IdUserUserArrendatario: { Id: number };
  FkArrendatamientoParcela: {
    Id: number;
  };
  FechaInicio: string;
  FechaFin: string;
  Valor: string;
  Activo: boolean;
}

@Component({
  selector: 'app-editar-arrendamientos',
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule
  ],
  providers: [DatePipe],
  templateUrl: './editar-arrendamientos.component.html',
  styleUrl: './editar-arrendamientos.component.css'
})
export class EditarArrendamientosComponent implements OnInit {
  arrendamientoForm: FormGroup;
  
  // Datos del arrendamiento
  arrendamiento: any = null;
  arrendatario: any = null;
  parcelas: Parcela[] = [];
  parcelasDisponibles: Parcela[] = [];
  parcelaActual: Parcela | null = null;
  
  // Estado
  loading: boolean = true;
  submitting: boolean = false;
  exito: boolean = false;
  errorMessage: string = '';
  
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<EditarArrendamientosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Inicializamos el formulario
    this.arrendamientoForm = this.fb.group({
      parcela: ['', Validators.required],
      tamanoParcela: [{value: '', disabled: true}],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      valor: ['', [Validators.required, Validators.min(1)]]
    }, {
      validators: this.fechasValidator()
    });
    
    // Escuchar cambios en la parcela seleccionada
    this.arrendamientoForm.get('parcela')?.valueChanges.subscribe(parcelaId => {
      if (parcelaId) {
        this.onParcelaChange(parcelaId);
      }
    });
  }

  ngOnInit(): void {
    if (!this.data?.arrendamientoId || !this.data?.fincaId) {
      this.errorMessage = 'No se proporcionaron los datos necesarios para editar el arrendamiento';
      this.loading = false;
      this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
      return;
    }
    
    this.cargarDatos();
  }
  
  cargarDatos(): void {
    this.loading = true;
    
    // Obtener detalles del arrendamiento y parcelas disponibles en paralelo
    forkJoin({
      arrendamiento: this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento/${this.data.arrendamientoId}`),
      parcelas: this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Parcela?query=FkFincaParcela.Id:${this.data.fincaId}`),
      parcelasArrendadas: this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/activos/${this.data.fincaId}`)
    }).subscribe({
      next: (response: any) => {
        // Procesar datos del arrendamiento
        // this.arrendamiento = response.arrendamiento;
        const wrapper = response.arrendamiento;
        this.arrendamiento = wrapper.Data;            
        this.arrendatario   = this.arrendamiento.IdUserUserArrendatario;
        this.arrendatario = this.arrendamiento.IdUserUserArrendatario;
        
        // Procesar parcelas
        this.parcelas = response.parcelas.Data || [];
        
        // Marcar parcelas arrendadas
        let parcelasArrendadas = Array.isArray(response.parcelasArrendadas) 
          ? response.parcelasArrendadas 
          : (response.parcelasArrendadas?.Data || []);

          console.log('[Editar] Arrendamiento Data:', this.arrendamiento);
          console.log('[Editar] Parcelas totales:', this.parcelas);
          console.log('[Editar] Parcelas arrendadas:', parcelasArrendadas);
        
        this.procesarParcelasDisponibles(parcelasArrendadas);
        
        // Establecer la parcela actual del arrendamiento
        this.parcelaActual = this.parcelas.find(p => p.Id === this.arrendamiento.FkArrendatamientoParcela?.Id) || null;
        
        
        // Poner valores iniciales en el formulario
        this.cargarFormulario();
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.errorMessage = 'Error al cargar los datos del arrendamiento';
        this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
  
  procesarParcelasDisponibles(parcelasArrendadas: any[]): void {
    // Marca las parcelas que ya están arrendadas
    this.parcelas = this.parcelas.map(parcela => {
      const estaArrendada = parcelasArrendadas.some(
        (a: any) => a.FkArrendatamientoParcela && a.FkArrendatamientoParcela.Id === parcela.Id
      );
      
      // Si es la parcela actual del arrendamiento que estamos editando, no la marcamos como arrendada
      if (this.arrendamiento && this.arrendamiento.FkArrendatamientoParcela && 
          this.arrendamiento.FkArrendatamientoParcela.Id === parcela.Id) {
        return { ...parcela, arrendada: false };
      }
      
      return { ...parcela, arrendada: estaArrendada };
    });
    
    // Filtrar parcelas disponibles (no arrendadas)
    this.parcelasDisponibles = this.parcelas.filter(p => !p.arrendada);
    
    // Agregar la parcela actual a las disponibles si no está
    if (this.parcelaActual && !this.parcelasDisponibles.some(p => p.Id === this.parcelaActual?.Id)) {
      this.parcelasDisponibles.push({ ...this.parcelaActual, arrendada: false });
    }
  }
  
  cargarFormulario(): void {
    if (!this.arrendamiento) return;
    
    this.arrendamientoForm.patchValue({
      parcela: this.arrendamiento.FkArrendatamientoParcela.Id,
      tamanoParcela: this.parcelaActual?.TamañoParcela || '',
      fechaInicio: new Date(this.arrendamiento.FechaInicio),
      fechaFin: new Date(this.arrendamiento.FechaFin),
      valor: this.arrendamiento.Valor
    });
  }
  
  onParcelaChange(parcelaId: number): void {
    const parcelaSeleccionada = this.parcelas.find(p => p.Id === parcelaId);
    
    if (parcelaSeleccionada) {
      this.arrendamientoForm.get('tamanoParcela')?.setValue(parcelaSeleccionada.TamañoParcela);
    }
  }
  
  onSubmit(): void {
    if (this.arrendamientoForm.invalid) {
      this.arrendamientoForm.markAllAsTouched();
      
      if (this.arrendamientoForm.errors?.['fechasInvalidas']) {
        this.snackBar.open('La fecha de finalización debe ser posterior a la fecha de inicio', 'Cerrar', { duration: 3000 });
      } else {
        this.snackBar.open('Por favor, complete correctamente todos los campos', 'Cerrar', { duration: 3000 });
      }
      return;
    }
    
    this.submitting = true;
    
    const formValues = this.arrendamientoForm.value;
    const parcelaSeleccionadaId = formValues.parcela;
    
    // Verificar si cambió la parcela
    const cambioParcela = this.arrendamiento.FkArrendatamientoParcela.Id !== parcelaSeleccionadaId;
    
    // Crear objeto para la solicitud
    const arrendamientoRequest: ArrendamientoRequest = {
      FkArrendamientoFinca: { Id: this.data.fincaId },
      IdUserUserArrendatario: { Id: this.arrendatario.Id },
      FkArrendatamientoParcela: { Id: parcelaSeleccionadaId },
      FechaInicio: this.formatDate(formValues.fechaInicio),
      FechaFin: this.formatDate(formValues.fechaFin),
      Valor: formValues.valor.toString(),
      Activo: this.arrendamiento.Activo
    };
    
    // Si cambió la parcela, creamos un nuevo arrendamiento y eliminamos el anterior
    if (cambioParcela) {
      this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/arrendamiento/`, arrendamientoRequest)
        .subscribe({
          next: (response) => {
            console.log('Nuevo arrendamiento creado:', response);
            
            // Eliminar el arrendamiento anterior
            // this.apiService.delete(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento/${this.arrendamiento.Id}`).subscribe({
            //   next: () => {
            //     this.snackBar.open('Arrendamiento actualizado con éxito', 'Cerrar', { duration: 3000 });
            //     this.exito = true;
            //     this.submitting = false;
            //     this.dialogRef.close({ actualizado: true });
            //   },
            //   error: (error) => {
            //     console.error('Error al eliminar arrendamiento anterior:', error);
            //     this.snackBar.open('Se creó el nuevo arrendamiento pero hubo un error al eliminar el anterior', 'Cerrar', { duration: 3000 });
            //     this.submitting = false;
            //   }
            // });
          },
          error: (error) => {
            console.error('Error al crear nuevo arrendamiento:', error);
            this.snackBar.open('Error al actualizar el arrendamiento', 'Cerrar', { duration: 3000 });
            this.submitting = false;
          }
        });
    } else {
      // Solo actualizamos los valores sin cambiar la parcela
      this.apiService.put(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento/${this.data.arrendamiento.Id}`, {
        FechaInicio: arrendamientoRequest.FechaInicio,
        FechaFin: arrendamientoRequest.FechaFin,
        Valor: arrendamientoRequest.Valor
      }).subscribe({
        next: (response) => {
          console.log('Arrendamiento actualizado:', response);
          this.snackBar.open('Arrendamiento actualizado con éxito', 'Cerrar', { duration: 3000 });
          this.exito = true;
          this.submitting = false;
          this.dialogRef.close({ actualizado: true });
        },
        error: (error) => {
          console.error('Error al actualizar arrendamiento:', error);
          this.snackBar.open('Error al actualizar el arrendamiento', 'Cerrar', { duration: 3000 });
          this.submitting = false;
        }
      });
    }
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }
  
  formatCurrency(event: any): void {
    const value = event.target.value.replace(/[^\d]/g, '');
    this.arrendamientoForm.get('valor')?.setValue(value);
  }
  
  // Validator personalizado para fechas
  fechasValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const fechaInicio = group.get('fechaInicio')?.value;
      const fechaFin = group.get('fechaFin')?.value;
      
      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        return inicio < fin ? null : { fechasInvalidas: true };
      }
      
      return null;
    };
  }
}
