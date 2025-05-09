import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EditarMapaComponent } from '../editar-mapa/editar-mapa.component';
import { MapComponent } from '../map/map.component';

interface Coordenadas {
  IdGeolocalizacion?: number;
  latitudInicial: number;
  longitudInicial: number;
  latitudFinal: number;
  longitudFinal: number;
}

@Component({
  selector: 'app-editar-finca',
  imports: [
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    EditarMapaComponent,
    MapComponent
  ],
  templateUrl: './editar-finca.component.html',
  styleUrl: './editar-finca.component.css'
})
export class EditarFincaComponent implements OnInit {
  finca: any = {
    Nombre: '',
    TipoSuelo: '',
    TotalParcelas: 0,
    AreaTotal: 0,
    parcelas: []
  };

  
  tiposSuelo: any[] = [];
  loading: boolean = true;
  fincaId!: number;
  errorMessage: string = '';
  mostrarFormularioNuevaParcela: boolean = false;
  
  // Formulario reactivo para nueva parcela
  nuevaParcelaForm: FormGroup;
  geolocalizacionNuevaParcela: any = null;

  @ViewChild(EditarMapaComponent) mapaComponent!: EditarMapaComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.nuevaParcelaForm = this.fb.group({
      NombreParcela: ['', [Validators.required, Validators.minLength(3)]],
      TamanoParcela: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.fincaId = history.state.fincaId;

    if (this.fincaId === undefined) {
      console.error('No se recibió el ID de la finca');
      this.snackBar.open('No se recibió el ID de la finca', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/dashboard/finca']);
      return;
    }
  
    console.log('ID de la finca recibido:', this.fincaId);
    this.obtenerFinca();
    this.obtenerTiposSuelo();
    this.obtenerParcelas();
  }
      
    
  

  obtenerFinca() {
    this.loading = true;
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/finca/buscarfinca/porid/${this.fincaId}`).subscribe({
      next: (response: any) => {
        this.finca = response;
        this.finca.TipoSuelo = { Nombre: response.TipoSuelo }; // Cambiamos el string a objeto
        this.obtenerTiposSuelo(); // Llamamos después de obtener la finca
        this.loading = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener la finca:', error);
        this.loading = false;
        this.snackBar.open('Error al cargar la finca', 'Cerrar', { duration: 3000 });
      }
    });
  }

  obtenerTiposSuelo() {
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/finca/tipos_suelo_usuario/usuario`).subscribe({
      next: (response: any) => {
        this.tiposSuelo = response;
  
        // Verificar si el tipo de suelo actual está incluido; si no, lo añadimos
        if (
          this.finca.TipoSuelo &&
          !this.tiposSuelo.some(t => t.Nombre === this.finca.TipoSuelo.Nombre)
        ) {
          this.tiposSuelo.unshift({ Nombre: this.finca.TipoSuelo.Nombre });
        }
      },
      error: (error) => {
        console.error('Error al obtener tipos de suelo:', error);
      }
    });
  }

  obtenerParcelas(): void {
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/finca/parcelas/${this.fincaId}`).subscribe({
      next: (parcelas: any) => {
        this.finca.parcelas = parcelas.map((parcela: any) => {
          if (parcela.Geolocalizacion) {
            parcela.Geolocalizacion.LatitudInicial = parseFloat(parcela.Geolocalizacion.LatitudInicial);
            parcela.Geolocalizacion.LatitudFinal = parseFloat(parcela.Geolocalizacion.LatitudFinal);
            parcela.Geolocalizacion.LongitudInicial = parseFloat(parcela.Geolocalizacion.LongitudInicial);
            parcela.Geolocalizacion.LongitudFinal = parseFloat(parcela.Geolocalizacion.LongitudFinal);
          }
          console.log("esta es la geolocalizacion de la parcela: ", parcela.Geolocalizacion)
          return parcela;
        });
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar las parcelas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  guardarCoordenadasParcela(coordenadasActualizadas: Coordenadas, index: number) {
    if (!coordenadasActualizadas) {
      console.error('❌ Coordenadas no definidas');
      return;
    }

    // Validar que todas las coordenadas necesarias estén presentes
    if (
      coordenadasActualizadas.latitudInicial == null ||
      coordenadasActualizadas.latitudFinal == null ||
      coordenadasActualizadas.longitudInicial == null ||
      coordenadasActualizadas.longitudFinal == null
    ) {
      console.error('❌ Coordenadas inválidas:', coordenadasActualizadas);
      return;
    }

    console.log('✅ Coordenadas recibidas para actualizar:', coordenadasActualizadas);

    // Crear una copia profunda de la parcela actual
    const parcelaActualizada = { ...this.finca.parcelas[index] };
    
    // Actualizar la geolocalización manteniendo el ID original
    parcelaActualizada.Geolocalizacion = {
      IdGeolocalizacion: parcelaActualizada.Geolocalizacion?.IdGeolocalizacion,
      LatitudInicial: coordenadasActualizadas.latitudInicial,
      LatitudFinal: coordenadasActualizadas.latitudFinal,
      LongitudInicial: coordenadasActualizadas.longitudInicial,
      LongitudFinal: coordenadasActualizadas.longitudFinal
    };

    // Actualizar la parcela en el array
    this.finca.parcelas[index] = parcelaActualizada;
    
    console.log('✅ Parcela actualizada con nuevas coordenadas:', this.finca.parcelas[index]);
  }

  guardarCambiosParcela(mapaComponent: EditarMapaComponent, parcela: any, index: number) {
    // Primero guardamos los cambios del mapa
    mapaComponent.guardarCambios();
    
    // Luego actualizamos la parcela
    this.actualizarParcela(parcela, index);
  }

  actualizarParcela(parcela: any, index: number) {
    console.log("Iniciando actualización de parcela");

    parcela = this.finca.parcelas[index];
    if (this.getEstadoParcela(parcela) !== 'Disponible') {
      this.snackBar.open('No se puede editar una parcela que está arrendada', 'Cerrar', { duration: 3000 });
      return;
    }

    // Obtener la parcela actualizada del array
    const parcelaActualizada = this.finca.parcelas[index];
    console.log('Parcela a actualizar:', parcelaActualizada);

    // Construir el objeto de actualización con el formato exacto requerido
    const datosActualizacion = {
      NombreParcela: parcelaActualizada.NombreParcela,
      TamanoParcela: parcelaActualizada.TamanoParcela,
      Geolocalizacion: parcelaActualizada.Geolocalizacion ? {
        id_geolocalizacion: parcelaActualizada.Geolocalizacion.IdGeolocalizacion,
        LatitudInicial: parcelaActualizada.Geolocalizacion.LatitudInicial.toString(),
        LatitudFinal: parcelaActualizada.Geolocalizacion.LatitudFinal.toString(),
        LongitudInicial: parcelaActualizada.Geolocalizacion.LongitudInicial.toString(),
        LongitudFinal: parcelaActualizada.Geolocalizacion.LongitudFinal.toString()
      } : null
    };

    console.log("Datos que se enviarán al servidor:", datosActualizacion);

    this.loading = true;
    this.apiService.patch(`${API_URLS.MID.API_MID_SPIKE}/finca/parcela/${parcelaActualizada.IdParcela}`, datosActualizacion).subscribe({
      next: () => {
        this.snackBar.open('Parcela actualizada exitosamente', 'Cerrar', { duration: 3000 });
        this.loading = false;
        // Actualizar la lista de parcelas después de la actualización
        this.obtenerParcelas();
      },
      error: (error) => {
        console.error('Error al actualizar la parcela:', error);
        this.snackBar.open('Error al actualizar la parcela', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  actualizarFinca() {
    this.loading = true;
    this.apiService.patch(`${API_URLS.MID.API_MID_SPIKE}/finca/${this.fincaId}`, this.finca).subscribe({
      next: () => {
        this.snackBar.open('Finca actualizada exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard/finca']);
      },
      error: (error) => {
        console.error('Error al actualizar la finca:', error);
        this.snackBar.open('Error al actualizar la finca', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  toggleFormularioNuevaParcela() {
    this.mostrarFormularioNuevaParcela = !this.mostrarFormularioNuevaParcela;
    if (!this.mostrarFormularioNuevaParcela) {
      this.nuevaParcelaForm.reset();
      this.geolocalizacionNuevaParcela = null;
    }
  }

  onGeolocalizacionChange(geolocalizacion: any) {
    this.geolocalizacionNuevaParcela = geolocalizacion;
  }

  async registrarNuevaParcela() {
    if (this.nuevaParcelaForm.invalid) {
      this.snackBar.open('Por favor complete todos los campos correctamente', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!this.geolocalizacionNuevaParcela) {
      this.snackBar.open('Debe seleccionar la ubicación de la parcela en el mapa', 'Cerrar', { duration: 3000 });
      return;
    }

    const nuevaParcela = [{
      ...this.nuevaParcelaForm.value,
      geolocalizacion: {
        LatitudInicial: this.geolocalizacionNuevaParcela.LatitudInicial.toString(),
        LatitudFinal: this.geolocalizacionNuevaParcela.LatitudFinal.toString(),
        LongitudInicial: this.geolocalizacionNuevaParcela.LongitudInicial.toString(),
        LongitudFinal: this.geolocalizacionNuevaParcela.LongitudFinal.toString()
      }
    }];

    console.log('Datos que se enviarán al backend para crear la parcela:', nuevaParcela);

    try {
      const response = await this.apiService.post(
        `${API_URLS.MID.API_MID_SPIKE}/finca/crear_parcelas/finca_id?finca_id=${this.fincaId}`,
        nuevaParcela
      ).toPromise();

      this.snackBar.open('Parcela registrada exitosamente', 'Cerrar', { duration: 3000 });
      this.toggleFormularioNuevaParcela();
      this.obtenerParcelas();

    } catch (error) {
      console.error('Error al registrar la parcela:', error);
      this.snackBar.open('Error al registrar la parcela', 'Cerrar', { duration: 3000 });
    }
  }

  editarParcela(parcela: any) {
    if (parcela.Estado === 'Arrendada' || parcela.Estado === 'Arrendamiento vencido') {
      // Lógica para editar parcela
    } else {
      this.snackBar.open('Esta parcela no puede editarse porque tiene un arrendamiento activo', 'Cerrar', { duration: 5000 });
    }
  }

  desactivarArrendamiento(parcela: any) {
    if (parcela.ArrendamientoId) {
      this.apiService.put(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/${parcela.ArrendamientoId}/desactivar`, {}).subscribe({
        next: () => {
          parcela.Estado = 'Disponible';
          this.snackBar.open('Arrendamiento desactivado exitosamente', 'Cerrar', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error al desactivar arrendamiento:', error);
          this.snackBar.open('Error al desactivar arrendamiento', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  getEstadoParcela(parcela: any): string {
    if (!parcela.ArrendamientoId) return 'Disponible';
    
    const ahora = new Date();
    const fechaFin = new Date(parcela.FechaFin);
    
    if (parcela.Activo && ahora > fechaFin) return 'Arrendamiento vencido';
    if (parcela.Activo) return 'Arrendada';
    
    return 'Disponible';
  }

  eliminarParcela(){
    
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Disponible': return '#28C76F';
      case 'Arrendada': return '#FF9F43';
      case 'Arrendamiento vencido': return '#EA5455';
      default: return '#B9B9C3';
    }
  }
  
}
