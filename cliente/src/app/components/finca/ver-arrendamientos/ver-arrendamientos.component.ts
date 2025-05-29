import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VerMapaComponent } from '../ver-mapa/ver-mapa.component';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

interface Geolocalizacion {
  IdGeolocalizacion: number;
  LatitudInicial: string;
  LongitudInicial: string;
  LatitudFinal: string;
  LongitudFinal: string;
}

interface Parcela {
  IdParcela: number;
  NombreParcela: string;
  TamanoParcela: number;
  Valor: string;
  Geolocalizacion: Geolocalizacion;
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
  selector: 'app-ver-arrendamientos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    VerMapaComponent
  ],
  providers: [DatePipe],
  templateUrl: './ver-arrendamientos.component.html',
  styleUrl: './ver-arrendamientos.component.css'
})
export class VerArrendamientosComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  error: string = '';
  detalleArrendamiento: DetalleArrendamiento | null = null;
  nombreFinca: string = '';
  private destroy$ = new Subject<void>();
  private arrendamientoId: number | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private datePipe: DatePipe
  ) {
    const navigation = this.router.getCurrentNavigation();
    console.log('Estado de navegación:', navigation?.extras.state);
    
    if (navigation?.extras.state) {
      const state = navigation.extras.state as any;
      this.arrendamientoId = state.arrendamientoId;
      this.nombreFinca = state.nombreFinca;
      console.log('ID de arrendamiento recibido:', this.arrendamientoId);
    } else {
      console.error('No se recibió estado en la navegación');
    }
  }

  ngOnInit(): void {
    console.log("Id del arrendamiento en ngOnInit: ", this.arrendamientoId);
    if (!this.arrendamientoId) {
      this.error = 'ID de arrendamiento no válido';
      this.loading = false;
      return;
    }
    this.cargarDetalleArrendamiento();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatDate(date: string): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  formatCurrency(value: number): string {
    if (!value) return '';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  }

  parseFloat(value: string): number {
    return window.parseFloat(value);
  }

  Number(value: string): number {
    return window.Number(value);
  }

  cargarDetalleArrendamiento(): void {
    this.loading = true;
    this.error = '';
    console.log('Cargando detalle para arrendamiento:', this.arrendamientoId);

    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/parcelasarrendamiento/${this.arrendamientoId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta de la API:', response); // Para depuración
          if (response && response.Geolocalizacion) {
            response.Geolocalizacion = {
              latitudInicial: parseFloat(response.Geolocalizacion.LatitudInicial),
              longitudInicial: parseFloat(response.Geolocalizacion.LongitudInicial),
              latitudFinal: parseFloat(response.Geolocalizacion.LatitudFinal),
              longitudFinal: parseFloat(response.Geolocalizacion.LongitudFinal)
            };
          }
          console.log('Respuesta de la API:', response);
          this.detalleArrendamiento = response;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error al obtener el detalle del arrendamiento:', error);
          this.error = 'Error al cargar la información del arrendamiento';
          this.loading = false;
        }
      });
  }

  volverAtras(): void {
    this.location.back();
  }
}
