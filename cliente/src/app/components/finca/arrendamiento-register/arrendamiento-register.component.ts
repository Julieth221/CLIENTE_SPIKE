import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

// Interfaces actualizadas
interface Finca {
  Id: number;
  Nombre: string;
  TotalParcelas: number;
}

interface Arrendatario {
  Id: number;
  Nombre: string;
  Contacto?: string;
}

interface Parcela {
  Id: number;
  NombreParcela: string;
  TamanoParcela: number;
  FkFincaParcela: {
    Id: number;
  };
  arrendada?: boolean;
  historial?: ArrendamientoHistorial[];
}

interface ArrendamientoHistorial {
  Id: number;
  FechaInicio: string;
  FechaFin: string;
  Valor: string;
  Arrendatario: {
    Id: number;
    Nombre: string;
  };
  Activo: boolean;
}

interface ParcelaArrendamiento {
  IdParcela: number;
  Valor: string;
}

interface ArrendamientoRequest {
  IdUserUserArrendatario: { Id: number };
  FkArrendamientoFinca: { Id: number };
  Parcelas: ParcelaArrendamiento[];
  FechaInicio: string;
  FechaFin: string;
}

@Component({
  selector: 'app-arrendamiento-register',
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
    MatStepperModule,
    MatChipsModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  templateUrl: './arrendamiento-register.component.html',
  styleUrl: './arrendamiento-register.component.css'
})
export class ArrendamientoRegisterComponent implements OnInit {
  arrendamientoForm: FormGroup;
  user_id: number | null = null;
  fincas: Finca[] = [];
  arrendatarios: Arrendatario[] = [];
  parcelas: Parcela[] = [];
  filteredParcelas: Parcela[] = [];
  historialArrendamientos: ArrendamientoHistorial[] = [];
  ultimoArrendatario: Arrendatario | null = null;
  usarUltimoArrendatario: boolean = false;
  
  loading: boolean = false;
  submitting: boolean = false;
  exito: boolean = false;
  errorMessage: string = '';
  
  get parcelasArray(): FormArray {
    return this.arrendamientoForm.get('parcelas') as FormArray;
  }
  
  maxParcelas: number = 0;
  parcelasDisponibles: number = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.arrendamientoForm = this.fb.group({
      finca: ['', Validators.required],
      arrendatario: ['', Validators.required],
      numParcelas: [1, [Validators.required, Validators.min(1)]],
      parcelas: this.fb.array([]),
      usarUltimoArrendatario: [false],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      confirmacion: [false, Validators.requiredTrue]
    });

    // Inicializar el array de parcelas con al menos un control
    this.actualizarParcelasFormArray(1);
    
    // Escuchar cambios en la finca seleccionada
    this.arrendamientoForm.get('finca')?.valueChanges.subscribe(fincaId => {
      if (fincaId) {
        this.onFincaChange(fincaId);
      }
    });
    
    // Escuchar cambios en número de parcelas
    this.arrendamientoForm.get('numParcelas')?.valueChanges.subscribe(num => {
      if (num) {
        this.actualizarParcelasFormArray(num);
      }
    });

    // Escuchar cambios en usarUltimoArrendatario
    this.arrendamientoForm.get('usarUltimoArrendatario')?.valueChanges.subscribe(usar => {
      this.onUsarUltimoArrendatarioChange(usar);
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.cargarDatosIniciales();
  }
  
  cargarDatosIniciales(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    forkJoin({
      fincas: this.apiService.get<{Data: Finca[]}>(`${API_URLS.CRUD.API_CRUD_FINCA}/Finca?query=Id_Usuario:${this.user_id}`),
      arrendatarios: this.apiService.get<Arrendatario[]>(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario?query=Id_Usuario:${this.user_id}`)
    }).subscribe({
      next: (response) => {
        this.fincas = response.fincas.Data || [];
        this.arrendatarios = response.arrendatarios;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos iniciales:', error);
        this.snackBar.open('Error al cargar datos necesarios para el formulario', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
  
  onFincaChange(fincaId: number): void {
    while (this.parcelasArray.length) {
      this.parcelasArray.removeAt(0);
    }
    
    const fincaSeleccionada = this.fincas.find(f => f.Id === fincaId);
    
    if (fincaSeleccionada) {
      this.maxParcelas = fincaSeleccionada.TotalParcelas;
      this.cargarParcelasDisponibles(fincaId);
      
      this.arrendamientoForm.get('numParcelas')?.setValue(1);
      this.actualizarParcelasFormArray(1);
    }
  }
  
  cargarParcelasDisponibles(fincaId: number): void {
    this.loading = true;
    
    this.apiService.get<Parcela[]>(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/disponibles/${fincaId}/`).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.parcelas = response;
          this.filteredParcelas = [...this.parcelas];
          this.parcelasDisponibles = this.parcelas.length;
        } else {
          this.parcelas = [];
          this.filteredParcelas = [];
          this.parcelasDisponibles = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar parcelas disponibles:', error);
        this.snackBar.open('Error al cargar las parcelas disponibles', 'Cerrar', { duration: 3000 });
        this.loading = false;
        this.parcelas = [];
        this.filteredParcelas = [];
        this.parcelasDisponibles = 0;
      }
    });
  }
  
  cargarHistorialParcela(parcelaId: number): void {
    this.apiService.get<{Data: any[]}>(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento_Parcela?query=FkParcela.Id:${parcelaId}&sortby=FechaFin&order=desc`).subscribe({
      next: (response) => {
        if (response && response.Data) {
          this.historialArrendamientos = response.Data.map((item: any) => ({
            Id: item.Id,
            FechaInicio: item.FechaInicio,
            FechaFin: item.FechaFin,
            Valor: item.Valor,
            TamanoParcela: item.TamanoParcela,
            Arrendatario: item.FkArrendamiento.IdUserUserArrendatario,
            Activo: item.Activo
          }));
          
          // Si hay historial, establecer el último arrendatario
          if (this.historialArrendamientos.length > 0) {
            this.ultimoArrendatario = this.historialArrendamientos[0].Arrendatario;
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
      }
    });
  }
  
  onUsarUltimoArrendatarioChange(usar: boolean): void {
    if (usar && this.ultimoArrendatario) {
      this.arrendamientoForm.get('arrendatario')?.setValue(this.ultimoArrendatario.Id);
    } else {
      this.arrendamientoForm.get('arrendatario')?.setValue('');
    }
  }
  
  onParcelaChange(index: number, parcelaId: number): void {
    const parcelaSeleccionada = this.parcelas.find(p => p.Id === parcelaId);
    
    if (parcelaSeleccionada) {
      (this.parcelasArray.at(index) as FormGroup).get('TamanoParcela')?.setValue(
        parcelaSeleccionada.TamanoParcela
      );
      
      this.cargarHistorialParcela(parcelaId);
      this.actualizarParcelasDisponibles();
    }
  }
  
  actualizarParcelasDisponibles(): void {
    const parcelasSeleccionadas = this.parcelasArray.controls
      .map(control => (control as FormGroup).get('parcela')?.value)
      .filter(id => id);
    
    this.filteredParcelas = this.parcelas.filter(
      parcela => !parcelasSeleccionadas.includes(parcela.Id)
    );
  }
  
  onSubmit(): void {
    if (this.arrendamientoForm.invalid) {
      this.arrendamientoForm.markAllAsTouched();
      this.snackBar.open('Por favor, complete correctamente todos los campos', 'Cerrar', { duration: 3000 });
      return;
    }
    
    this.submitting = true;
    
    const formValues = this.arrendamientoForm.value;
    
    const arrendamientoRequest: ArrendamientoRequest = {
      IdUserUserArrendatario: { Id: formValues.arrendatario },
      FkArrendamientoFinca: { Id: formValues.finca },
      FechaInicio: this.formatDate(formValues.fechaInicio),
      FechaFin: this.formatDate(formValues.fechaFin),
      Parcelas: formValues.parcelas.map((parcelaForm: any) => ({
        IdParcela: parcelaForm.parcela,
        Valor: parcelaForm.valor.toString()
      }))
    };
    
    this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/arrendamiento/`, arrendamientoRequest)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Arrendamientos registrados con éxito', 'Cerrar', { duration: 3000 });
          this.submitting = false;
          this.exito = true;
          this.resetForm();
        },
        error: (error) => {
          console.error('Error al registrar arrendamientos:', error);
          this.snackBar.open('Error al registrar los arrendamientos', 'Cerrar', { duration: 3000 });
          this.submitting = false;
        }
      });
  }
  
  resetForm(): void {
    this.arrendamientoForm.reset({
      numParcelas: 1,
      usarUltimoArrendatario: false
    });
    this.actualizarParcelasFormArray(1);
    this.historialArrendamientos = [];
    this.ultimoArrendatario = null;
  }
  
  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }
  
  formatCurrency(event: any): void {
    const value = event.target.value.replace(/[^\d]/g, '');
    const formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
    this.arrendamientoForm.get('valor')?.setValue(value);
  }
  
  getParcelasDisponiblesParaSelect(index: number): Parcela[] {
    const parcelasSeleccionadas = this.parcelasArray.controls
      .map((control, i) => i !== index ? (control as FormGroup).get('parcela')?.value : null)
      .filter(id => id);
    
    return this.parcelas.filter(
      parcela => !parcelasSeleccionadas.includes(parcela.Id)
    );
  }

  actualizarParcelasFormArray(cantidad: number): void {
    const parcelasArray = this.arrendamientoForm.get('parcelas') as FormArray;
    
    // Limpiar el array actual
    while (parcelasArray.length) {
      parcelasArray.removeAt(0);
    }
    
    // Ajustar la cantidad al número de parcelas disponibles
    const cantidadAjustada = Math.min(cantidad, this.parcelasDisponibles);
    
    // Agregar los nuevos controles
    for (let i = 0; i < cantidadAjustada; i++) {
      parcelasArray.push(
        this.fb.group({
          parcela: ['', Validators.required],
          TamanoParcela: [{value: '', disabled: true}],
          valor: ['', [Validators.required, Validators.min(1)]]
        })
      );
    }
  }

  getFincaNombre(): string {
    const fincaId = this.arrendamientoForm.get('finca')?.value;
    const finca = this.fincas.find(f => f.Id === fincaId);
    return finca ? finca.Nombre : 'No seleccionada';
  }

  getArrendatarioNombre(): string {
    const arrendatarioId = this.arrendamientoForm.get('arrendatario')?.value;
    const arrendatario = this.arrendatarios.find(a => a.Id === arrendatarioId);
    return arrendatario ? arrendatario.Nombre : 'No seleccionado';
  }

  getParcelaNombre(index: number): string {
    const parcelaId = this.parcelasArray.at(index).get('parcela')?.value;
    const parcela = this.parcelas.find(p => p.Id === parcelaId);
    return parcela ? parcela.NombreParcela : 'No seleccionada';
  }

  getParcelaTamano(index: number): number {
    return this.parcelasArray.at(index).get('TamanoParcela')?.value || 0;
  }

  getParcelaFechaInicio(index: number): Date | null {
    const fecha = this.parcelasArray.at(index).get('fechaInicio')?.value;
    return fecha ? new Date(fecha) : null;
  }

  getParcelaFechaFin(index: number): Date | null {
    const fecha = this.parcelasArray.at(index).get('fechaFin')?.value;
    return fecha ? new Date(fecha) : null;
  }

  getParcelaValor(index: number): number {
    return this.parcelasArray.at(index).get('valor')?.value || 0;
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/finca/datosArrendamiento']);
  }

  calcularValorTotal(): number {
    const parcelas = this.parcelasArray.controls;
    return parcelas.reduce((total, parcela) => {
      const valor = parcela.get('valor')?.value || 0;
      return total + Number(valor);
    }, 0);
  }
}
