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
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { forkJoin } from 'rxjs';

// Interfaces para manejar la estructura de datos
interface Finca {
  Id: number;
  Nombre: string;
  TotalParcelas: number;
}

interface Arrendatario {
  Id: number;
  Nombre: string;
  Contacto: string;
}

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
}

interface ArrendamientoActivo {
  Id: number;
  Parcelas: string[];
  FechaInicio: string;
  FechaFin: string;
  Activo: boolean;
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
    MatChipsModule
  ],
  templateUrl: './arrendamiento-register.component.html',
  styleUrl: './arrendamiento-register.component.css'
})
export class ArrendamientoRegisterComponent implements OnInit {
  arrendamientoForm: FormGroup;
  user_id: number | null = null;
  fincas: any[] = [];
  arrendatarios: any[] = [];
  parcelas: any[] = [];
  filteredParcelas: any[] = [];
  
  loading: boolean = false;
  submitting: boolean = false;
  exito: boolean = false;
  
  get parcelasArray(): FormArray {
    return this.arrendamientoForm.get('parcelas') as FormArray;
  }
  
  maxParcelas: number = 0;
  parcelasDisponibles: number = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.arrendamientoForm = this.fb.group({
      finca: ['', Validators.required],
      arrendatario: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(1)]],
      numParcelas: [1, [Validators.required, Validators.min(1)]],
      parcelas: this.fb.array([])
    });
    
    // Escuchar cambios en la finca seleccionada
    this.arrendamientoForm.get('finca')?.valueChanges.subscribe(fincaId => {
      if (fincaId) {
        this.onFincaChange(fincaId);
      }
    });
    
    // Escuchar cambios en número de parcelas
    this.arrendamientoForm.get('numParcelas')?.valueChanges.subscribe(num => {
      this.actualizarParcelasFormArray(num);
    });
  }

  ngOnInit(): void {
    // Obtenemos el ID del usuario del token JWT
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      console.log('No se encontró información del usuario');
      return;
    }
    
    this.cargarDatosIniciales();
  }
  
  cargarDatosIniciales(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    // Realizamos múltiples solicitudes en paralelo
    forkJoin({
      fincas: this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Finca?query=Id_Usuario:${this.user_id}`),
      arrendatarios: this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/User_Arrendatario?query=Id_Usuario:${this.user_id}`)
    }).subscribe({
      next: (response: any) => {
        this.fincas = response.fincas.Data || []
        this.arrendatarios = response.arrendatarios
        this.loading = false;
        
        console.log('Fincas cargadas:', this.fincas);
        console.log('Arrendatarios cargados:', this.arrendatarios);
      },
      error: (error) => {
        console.error('Error al cargar datos iniciales:', error);
        this.snackBar.open('Error al cargar datos necesarios para el formulario', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
  
  onFincaChange(fincaId: number): void {
    // Reiniciamos el array de parcelas del formulario
    while (this.parcelasArray.length) {
      this.parcelasArray.removeAt(0);
    }
    
    const fincaSeleccionada = this.fincas.find(f => f.Id === fincaId);
    
    if (fincaSeleccionada) {
      this.maxParcelas = fincaSeleccionada.TotalParcelas;
      this.cargarParcelasDeFinca(fincaId);
      
      // Reiniciar el número de parcelas a 1
      this.arrendamientoForm.get('numParcelas')?.setValue(1);
      this.actualizarParcelasFormArray(1);
    }
  }
  
  cargarParcelasDeFinca(fincaId: number): void {
    this.loading = true;
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Parcela?query=FkFincaParcela.Id:${fincaId}`).subscribe({
      next: (response: any) => {
        this.parcelas = response.Data || [];
        this.filteredParcelas = [...this.parcelas];
        
        if (this.parcelas.length === 0) {
          console.log('No se encontraron parcelas para esta finca');
          this.parcelasDisponibles = 0;
          this.loading = false;
          return;
        }
        
        this.verificarParcelasArrendadas(fincaId);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
        this.snackBar.open('Error al cargar las parcelas de la finca', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }
  
  verificarParcelasArrendadas(fincaId: number): void {
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/activos/${fincaId}/`)
      .subscribe({
        next: (response: any) => {
          console.log("Respuesta de arrendamientos activos:", response);
          
          let arrendamientosActivos: ArrendamientoActivo[] = [];
          
          if (response === null) {
            console.log("La respuesta de arrendamientos activos es null, se usará un array vacío");
          } else if (Array.isArray(response)) {
            arrendamientosActivos = response;
          } else if (response.Data && Array.isArray(response.Data)) {
            arrendamientosActivos = response.Data;
          } else {
            console.log("La respuesta de arrendamientos activos no tiene un formato válido:", response);
          }
          
          this.procesarParcelasDisponibles(arrendamientosActivos);
        },
        error: (error) => {
          console.error('Error al verificar parcelas arrendadas:', error);
          this.procesarParcelasDisponibles([]);
        }
      });
  }
  
  procesarParcelasDisponibles(arrendamientosActivos: ArrendamientoActivo[]): void {
    if (!this.parcelas || !Array.isArray(this.parcelas)) {
      console.error("No hay parcelas disponibles para procesar");
      this.parcelasDisponibles = 0;
      return;
    }
    
    // Obtener todas las parcelas que están en arrendamientos activos
    const parcelasArrendadas = new Set<string>();
    arrendamientosActivos.forEach(arrendamiento => {
      if (arrendamiento.Parcelas && Array.isArray(arrendamiento.Parcelas)) {
        arrendamiento.Parcelas.forEach(nombreParcela => {
          parcelasArrendadas.add(nombreParcela);
        });
      }
    });
    
    // Marcar las parcelas como arrendadas o disponibles
    this.parcelas = this.parcelas.map(parcela => {
      if (!parcela) return parcela;
      
      const estaArrendada = parcelasArrendadas.has(parcela.NombreParcela);
      return { ...parcela, arrendada: estaArrendada };
    });
    
    // Filtrar solo las parcelas disponibles
    this.filteredParcelas = this.parcelas.filter(p => !p.arrendada);
    this.parcelasDisponibles = this.filteredParcelas.length;
    
    console.log(`Parcelas disponibles: ${this.parcelasDisponibles} de ${this.parcelas.length} total`);
    console.log('Parcelas arrendadas:', Array.from(parcelasArrendadas));
    
    // Actualizar validadores del control numParcelas
    const numParcelasControl = this.arrendamientoForm.get('numParcelas');
    if (numParcelasControl) {
      numParcelasControl.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(this.parcelasDisponibles || 1)
      ]);
      numParcelasControl.updateValueAndValidity();
      
      // Ajustar el valor actual si es necesario
      const valorActual = numParcelasControl.value;
      if (valorActual > this.parcelasDisponibles) {
        numParcelasControl.setValue(Math.max(1, this.parcelasDisponibles));
        this.actualizarParcelasFormArray(Math.max(1, this.parcelasDisponibles));
      }
    }
  }
  
  actualizarParcelasFormArray(cantidad: number): void {
    const parcelasArray = this.arrendamientoForm.get('parcelas') as FormArray;
    
    const cantidadAjustada = Math.min(cantidad, this.parcelasDisponibles);
    
    while (parcelasArray.length) {
      parcelasArray.removeAt(0);
    }
    
    for (let i = 0; i < cantidadAjustada; i++) {
      parcelasArray.push(
        this.fb.group({
          parcela: ['', Validators.required],
          TamanoParcela: [{value: '', disabled: true}]
        })
      );
    }
    
    console.log(`Se crearon ${cantidadAjustada} controles de parcela de ${cantidad} solicitados`);
  }
  
  onParcelaChange(index: number, parcelaId: number): void {
    const parcelaSeleccionada = this.parcelas.find(p => p.Id === parcelaId);
    
    if (parcelaSeleccionada) {
      // Establece el tamaño de la parcela seleccionada
      (this.parcelasArray.at(index) as FormGroup).get('TamanoParcela')?.setValue(
        parcelaSeleccionada.TamanoParcela
      );
      
      // Eliminar esta parcela de las opciones disponibles para otros selects
      this.actualizarParcelasDisponibles();
    }
  }
  
  actualizarParcelasDisponibles(): void {
    // Obtener IDs de parcelas ya seleccionadas
    const parcelasSeleccionadas = this.parcelasArray.controls
      .map(control => (control as FormGroup).get('parcela')?.value)
      .filter(id => id);
    
    // Filtrar parcelas disponibles excluyendo las ya seleccionadas y las arrendadas
    this.filteredParcelas = this.parcelas.filter(
      parcela => !parcelasSeleccionadas.includes(parcela.Id) && !parcela.arrendada
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
    const fechaInicio = this.formatDate(formValues.fechaInicio);
    const fechaFin = this.formatDate(formValues.fechaFin);
    
    const solicitudes = formValues.parcelas.map((parcelaForm: any) => {
      const arrendamientoRequest: ArrendamientoRequest = {
        FkArrendamientoFinca: { Id: formValues.finca },
        IdUserUserArrendatario: { Id: formValues.arrendatario },
        FkArrendatamientoParcela: { Id: parcelaForm.parcela },
        FechaInicio: fechaInicio,
        FechaFin: fechaFin,
        Valor: formValues.valor.toString()
      };
      console.log(arrendamientoRequest)
      return this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/arrendamiento/`, arrendamientoRequest);
    });
    
    forkJoin(solicitudes).subscribe({
      next: (responses) => {
        console.log('Arrendamientos registrados correctamente:', responses);
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
      numParcelas: 1
    });
    this.actualizarParcelasFormArray(1);
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
  
  estaParcelaSeleccionada(parcelaId: number): boolean {
    return this.parcelasArray.controls.some(
      control => (control as FormGroup).get('parcela')?.value === parcelaId
    );
  }
  
  getParcelasDisponiblesParaSelect(index: number): Parcela[] {
    // Obtener IDs de parcelas ya seleccionadas en otros controles
    const parcelasSeleccionadas = this.parcelasArray.controls
      .map((control, i) => i !== index ? (control as FormGroup).get('parcela')?.value : null)
      .filter(id => id);
    
    // Devolver parcelas no seleccionadas en otros controles y no arrendadas
    return this.parcelas.filter(
      parcela => !parcelasSeleccionadas.includes(parcela.Id) && !parcela.arrendada
    );
  }
}
