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
import { MatStepperModule } from '@angular/material/stepper';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { Router, ActivatedRoute } from '@angular/router';

interface Parcela {
  IdParcela: number;
  NombreParcela: string;
  TamanoParcela: number;
  Valor: string;
}

interface DetalleArrendamiento {
  IdArrendamiento: number;
  NombreArrendatario: string;
  ContactoArrendatario: string;
  FechaInicio: string;
  FechaFin: string;
  ValorTotal: number;
  Parcelas: Parcela[];
  IdUserUserArrendatario: {
    Id: number;
  };
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
    MatStepperModule
  ],
  providers: [DatePipe],
  templateUrl: './editar-arrendamientos.component.html',
  styleUrl: './editar-arrendamientos.component.css'
})
export class EditarArrendamientosComponent implements OnInit {
  arrendamientoForm: FormGroup;
  detalleArrendamiento: DetalleArrendamiento | null = null;
  private arrendamientoId: number | null = null;
  private fincaId: number | null = null;
  
  // Estado
  loading: boolean = true;
  submitting: boolean = false;
  errorMessage: string = '';
  tieneSeguimientoActivo: boolean = false;
  nombreFinca: string = '';
  
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {
    {const navigation = this.router.getCurrentNavigation();
      console.log('Estado de navegación:', navigation?.extras.state);
      
      if (navigation?.extras.state) {
        const state = navigation.extras.state as any;
        this.arrendamientoId = state.arrendamientoId;
        this.fincaId = state.fincaId;
        console.log('ID de arrendamiento recibido:', this.arrendamientoId);
      } else {
        console.error('No se recibió estado en la navegación');
      }}
    this.arrendamientoForm = this.fb.group({
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      valor: ['', [Validators.required, Validators.min(1)]]
    }, {
      validators: this.fechasValidator()
    });
  }

  ngOnInit(): void {
    console.log("Id del arrendamiento en ngOnInit: ", this.arrendamientoId);
    if (!this.arrendamientoId) {
      this.errorMessage = 'ID de arrendamiento no válido';
      this.loading = false;
      return;
    }
    this.cargarDetalleArrendamiento(this.arrendamientoId);
  }
  
  cargarDetalleArrendamiento(arrendamientoId: number): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/parcelasarrendamiento/${arrendamientoId}`)
      .subscribe({
        next: (response: any) => {
          this.detalleArrendamiento = response;
          console.log("Este es el detalle del arrendamiento: ", this.detalleArrendamiento)
          this.cargarFormulario();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar el detalle:', error);
          this.errorMessage = 'Error al cargar los datos del arrendamiento';
          this.loading = false;
        }
      });
  }
  
  cargarFormulario(): void {
    if (!this.detalleArrendamiento) return;
    
    this.arrendamientoForm.patchValue({
      fechaInicio: new Date(this.detalleArrendamiento.FechaInicio),
      fechaFin: new Date(this.detalleArrendamiento.FechaFin),
      valor: this.detalleArrendamiento.ValorTotal
    });
  }
  
  onSubmit(): void {
    if (this.arrendamientoForm.invalid) {
      this.arrendamientoForm.markAllAsTouched();
      return;
    }
    
    this.submitting = true;
    
    const formValues = this.arrendamientoForm.value;
    const request = {
      IdArrendamientoAnterior: this.arrendamientoId  ,
      FkArrendamientoFinca: { Id: this.fincaId },
      IdUserUserArrendatario:  this.detalleArrendamiento?.IdUserUserArrendatario ,
      FechaInicio: this.formatDate(formValues.fechaInicio).toString(),
      FechaFin: this.formatDate(formValues.fechaFin).toString(),
      // Valor: formValues.valor.toString(),
      Activo: true,
      Parcelas: this.detalleArrendamiento?.Parcelas.map(p => ({
        IdParcela: p.IdParcela,
        Valor: formValues.valor.toString()
      }))
    };

    console.log("Este es el body request que se envia al mid para versionar el arrendamiento: ", request)
    
    this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/arrendamiento/versionar`, request)
      .subscribe({
        next: (response: any) => {
          this.snackBar.open('Nueva versión del arrendamiento creada con éxito', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard/finca/datosArrendamiento']);
        },
        error: (error) => {
          console.error('Error al crear nueva versión:', error);
          this.errorMessage = 'Error al crear la nueva versión del arrendamiento';
          this.submitting = false;
        }
      });
  }
  
  onCancel(): void {
    this.router.navigate(['/dashboard/finca/datosArrendamiento']);
  }

  crearNuevoArrendamiento(): void {
    this.router.navigate(['/dashboard/finca/datosArrendamiento']);
  }
  
  formatDate(date: string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }
  
  formatCurrency(value: number | undefined): string {
    if (!value) return '';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  }
  
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
