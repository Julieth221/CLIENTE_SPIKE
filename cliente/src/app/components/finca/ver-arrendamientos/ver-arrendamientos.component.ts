import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VerMapaComponent } from '../ver-mapa/ver-mapa.component';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Geolocalizacion {
  Id: number;
  LatitudInicial: string;
  LongitudInicial: string;
  LatitudFinal: string;
  LongitudFinal: string;
  Activo: boolean;
}

interface Parcela {
  Id: number;
  NombreParcela: string;
  TamanoParcela: number;
  Activo: boolean;
  FkFincaParcela?: any;
}

interface FincaParcela {
  Id: number;
  FkFincaParcela: any;
  FkParcelaFinca: Parcela;
  FkGeolocalizacion: Geolocalizacion;
  Activo: boolean;
}

interface ParcelaDetalle {
  id: number;
  nombre: string;
  tamano: number;
  coordenadas: {
    latitudInicial: number;
    longitudInicial: number;
    latitudFinal: number;
    longitudFinal: number;
  };
}

@Component({
  selector: 'app-ver-arrendamientos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule,
    VerMapaComponent
  ],
  
  templateUrl: './ver-arrendamientos.component.html',
  styleUrl: './ver-arrendamientos.component.css'
})
export class VerArrendamientosComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  error: string = '';
  parcelas: ParcelaDetalle[] = [];
  todasLasParcelas: ParcelaDetalle[] = [];
  
  // Paginación
  pageSize: number = 3;
  pageSizeOptions: number[] = [3, 6, 9, 12];
  pageIndex: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    public dialogRef: MatDialogRef<VerArrendamientosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { arrendamientoId: number, nombreFinca: string, fincaId: number }
  ) {}

  ngOnInit(): void {
    this.cargarParcelas();
    console.log("Este es el id del arrendamiento", this.data.arrendamientoId);
    console.log("Este es el id de la finca", this.data.fincaId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarParcelas(): void {
    if (!this.data.arrendamientoId) {
      this.error = 'ID de arrendamiento no válido';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.parcelas = [];
    console.log('No se recibió arrendamientoId:', this.data.arrendamientoId);

    // Obtener las parcelas asociadas al arrendamiento
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/parcelasarrendamiento/${this.data.arrendamientoId}`).subscribe({
        next: (parcelasResponse: any) => {
          if (!Array.isArray(parcelasResponse)) {
            this.loading = false;
            this.error = 'Formato de respuesta inválido';
            return;
          }

          // Procesar las parcelas recibidas
          const parcelasDetalle: ParcelaDetalle[] = parcelasResponse.map((parcela: any) => ({
            id: parcela.IdParcela,
            nombre: parcela.NombreParcela,
            tamano: parcela.TamanoParcela,
            coordenadas: {
              latitudInicial: parseFloat(parcela.Geolocalizacion.LatitudInicial),
              longitudInicial: parseFloat(parcela.Geolocalizacion.LongitudInicial),
              latitudFinal: parseFloat(parcela.Geolocalizacion.LatitudFinal),
              longitudFinal: parseFloat(parcela.Geolocalizacion.LongitudFinal)
            }
          }));

          this.todasLasParcelas = parcelasDetalle;
          this.parcelas = this.todasLasParcelas;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al obtener las parcelas del arrendamiento:', error);
          this.loading = false;
          this.error = 'Error al cargar la información de las parcelas';
        }
      });
  }

  // Actualizar las parcelas según la paginación actual
  actualizarParcelas(): void {
    this.parcelas = this.todasLasParcelas;
  }

  // Función para calcular los vértices del polígono a partir de las coordenadas
  calcularVertices(coordenadas: any): any[] {
    if (!coordenadas) return [];
    
    const { latitudInicial, longitudInicial, latitudFinal, longitudFinal } = coordenadas;
    
    // Crear los 4 vértices del rectángulo
    return [
      { lat: latitudInicial, lng: longitudInicial }, // Esquina noroeste
      { lat: latitudInicial, lng: longitudFinal },  // Esquina noreste
      { lat: latitudFinal, lng: longitudFinal },   // Esquina sureste
      { lat: latitudFinal, lng: longitudInicial }  // Esquina suroeste
    ];
  }

  // Calcular el centro de la parcela para centrar el mapa
  calcularCentro(coordenadas: any): any {
    if (!coordenadas) return { lat: 4.570868, lng: -74.297333 }; // Coordenadas por defecto (Colombia)
    
    const { latitudInicial, longitudInicial, latitudFinal, longitudFinal } = coordenadas;
    
    return {
      lat: (latitudInicial + latitudFinal) / 2,
      lng: (longitudInicial + longitudFinal) / 2
    };
  }
}
