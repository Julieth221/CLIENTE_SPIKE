import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { curveBasis } from 'd3-shape';

interface RegistroCultivo {
  Id: number;
  Nombre: string;
  FechaSiembra: string;
  CicloDias: number;
  FkEstadoFenologicoCultivo: {
    Id: number;
    Nombre: string;
  };
  FkMetodoSiembra: {
    Id: number;
    Nombre: string;
  };
  AreaSembrada: number;
  Activo: boolean;
}

interface Insumo {
  Id: number;
  FkRegistroCultivo: {
    Id: number;
  };
  FkTipoInsumo: {
    Id: number;
    Nombre: string;
  };
  FkCategoriaInsumo: {
    Id: number;
    Nombre: string;
  };
  FkMetodoAplicacionInsumo: {
    Id: number;
    Nombre: string;
  };
  NombreInsumo: string;
  FechaAplicacion: string;
  CantidadAplicada: number;
  Observaciones: string;
  Activo: boolean;
}

interface Sensor {
  IdSensor: number;
  IdentificadorSensor: string;
  Lecturas: LecturaSensor[];
}

interface LecturaSensor {
  datos_sensor: { [key: string]: number };
  fecha_lectura: string;
  identificador_sensor: string;
}

interface AlertaSensor {
  Id: number;
  FkSensor: {
    Id: number;
    IdentificadorSensor: string;
  };
  TipoAlerta: string;
  Mensaje: string;
  FechaAlerta: string;
  Severidad: 'alta' | 'media' | 'baja';
}

interface RendimientoEstimado {
  mensaje: string;
  rendimientoTonPorHa: number;
}

interface CultivoFase {
  Id: number;
  FkCultivoFase: {
    Id: number;
  };
  FkFaseCultivo: {
    Id: number;
    NombreFase: string;
  };
  FechaInicio: string;
  FechaFin: string;
  Observaciones: string;
  Completada: boolean;
  Activo: boolean;
}

@Component({
  selector: 'app-dashboard-cultivo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTooltipModule,
    NgxChartsModule
  ],
  templateUrl: './dashboard-cultivo.component.html',
  styleUrls: ['./dashboard-cultivo.component.css']
})
export class DashboardCultivoComponent implements OnInit {
  cultivos: RegistroCultivo[] = [];
  cultivoSeleccionado: RegistroCultivo | null = null;
  insumos: Insumo[] = [];
  sensores: Sensor[] = [];
  alertas: AlertaSensor[] = [];
  loading: boolean = false;
  user_id: number | null = null;
  rendimientoEstimado: RendimientoEstimado | null = null;
  faseActual: string = '';
  progresoFase: number = 0;

  // Configuración de gráficas
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Fecha';
  showYAxisLabel = true;
  yAxisLabel = 'Valor';
  timeline = true;
  curve = curveBasis;
  colorScheme = {
    domain: ['#2196F3', '#4CAF50', '#FFC107', '#F44336']
  };

  // Datos para gráficas
  temperaturaData: any[] = [];
  humedadData: any[] = [];

  // Estructura para gráficas dinámicas
  graficasVariables: { [key: string]: any[] } = {};
  tiposVariables: string[] = [];

  // Paletas de colores para variables
  colorSchemes: { [key: string]: any } = {
    temperatura: { domain: ['#ff6e40', '#ffb300', '#ff3d00'] },
    humedad: { domain: ['#42a5f5', '#00bcd4', '#1976d2'] },
    ph: { domain: ['#8bc34a', '#558b2f', '#cddc39'] },
    default: { domain: ['#7e57c2', '#ab47bc', '#5c6bc0'] }
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    if (this.user_id) {
      this.cargarCultivos();
    }
  }

  cargarCultivos(): void {
    this.loading = true;
    this.apiService.get<RegistroCultivo[]>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Registro_Cultivo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.cultivos = response.Data.filter((cultivo: RegistroCultivo) => cultivo.Activo);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.loading = false;
      }
    });
  }

  onCultivoSeleccionado(cultivoId: number): void {
    this.cultivoSeleccionado = this.cultivos.find(c => c.Id === cultivoId) || null;
    if (this.cultivoSeleccionado) {
      this.cargarDatosCultivo();
    }
  }

  cargarDatosCultivo(): void {
    if (!this.cultivoSeleccionado) return;

    this.loading = true;
    Promise.all([
      this.cargarInsumos(),
      this.cargarSensores(),
      this.cargarAlertas(),
      this.cargarRendimientoEstimado(),
      this.cargarFaseActual()
    ]).finally(() => {
      this.loading = false;
    });
  }

  cargarInsumos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<Insumo[]>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Insumo?query=FkRegistroCultivo.Id:${this.cultivoSeleccionado?.Id}`).subscribe({
        next: (response: any) => {
          this.insumos = response.Data.filter((insumo: Insumo) => insumo.Activo);
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar insumos:', error);
          reject(error);
        }
      });
    });
  }

  cargarSensores(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<Sensor[]>(`${API_URLS.MID.API_MID_SPIKE}/monitoreo_cultivo_sensor/SensoresPorCultivo/${this.cultivoSeleccionado?.Id}`).subscribe({
        next: (response: any) => {
          this.sensores = response.Sensores;
          this.procesarDatosGraficas();
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar sensores:', error);
          reject(error);
        }
      });
    });
  }

  cargarAlertas(): Promise<void> {
    return new Promise((resolve, reject) => {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 15);
      
      this.apiService.get<AlertaSensor[]>(`${API_URLS.MID.API_MID_SPIKE}/alertas_sensor?cultivoId=${this.cultivoSeleccionado?.Id}&fechaDesde=${fechaLimite.toISOString()}`).subscribe({
        next: (response: any) => {
          this.alertas = response.Data;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar alertas:', error);
          reject(error);
        }
      });
    });
  }

  cargarRendimientoEstimado(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<RendimientoEstimado>(`${API_URLS.MID.API_MID_SPIKE}/monitoreo_cultivo_sensor/prediccion/rendimientoestimado/${this.cultivoSeleccionado?.Id}`).subscribe({
        next: (response: any) => {
          this.rendimientoEstimado = response;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar rendimiento estimado:', error);
          reject(error);
        }
      });
    });
  }

  cargarFaseActual(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<CultivoFase[]>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Cultivo_Fase?query=FkCultivoFase.Id:${this.cultivoSeleccionado?.Id}&Completada:true`).subscribe({
        next: (response: any) => {
          const fasesCompletadas = response.Data;
          const ultimaFase = fasesCompletadas[fasesCompletadas.length - 1];
          
          if (ultimaFase) {
            const faseActual = this.obtenerSiguienteFase(ultimaFase.FkFaseCultivo.NombreFase);
            this.faseActual = faseActual.nombre;
            this.progresoFase = faseActual.progreso;
          } else {
            this.faseActual = 'Germinación';
            this.progresoFase = 0.50;
          }
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar fase actual:', error);
          reject(error);
        }
      });
    });
  }

  obtenerSiguienteFase(faseActual: string): { nombre: string, progreso: number } {
    const fases = [
      { nombre: 'Germinación', progreso: 0.10 },
      { nombre: 'Plántula', progreso: 0.20 },
      { nombre: 'Macollamiento', progreso: 0.35 },
      { nombre: 'Elongación del tallo', progreso: 0.50 },
      { nombre: 'Iniciación de panícula', progreso: 0.65 },
      { nombre: 'Floración', progreso: 0.80 },
      { nombre: 'Grano lechoso', progreso: 0.90 },
      { nombre: 'Grano pastoso', progreso: 0.95 },
      { nombre: 'Grano maduro', progreso: 1.00 }
    ];

    const indexActual = fases.findIndex(f => f.nombre.toLowerCase() === faseActual.toLowerCase());
    if (indexActual === -1 || indexActual === fases.length - 1) {
      return fases[0];
    }
    return fases[indexActual + 1];
  }

  procesarDatosGraficas(): void {
    this.graficasVariables = {};
    this.tiposVariables = [];

    // Detectar todos los tipos de variables presentes en los sensores
    this.sensores.forEach(sensor => {
      if (sensor.Lecturas && sensor.Lecturas.length > 0) {
        sensor.Lecturas.forEach(lectura => {
          Object.keys(lectura.datos_sensor).forEach(variable => {
            if (!this.tiposVariables.includes(variable)) {
              this.tiposVariables.push(variable);
            }
          });
        });
      }
    });

    // Inicializar estructura para cada variable
    this.tiposVariables.forEach(variable => {
      this.graficasVariables[variable] = [];
    });

    // Construir series para cada variable y sensor
    this.sensores.forEach(sensor => {
      if (sensor.Lecturas && sensor.Lecturas.length > 0) {
        this.tiposVariables.forEach(variable => {
          // Solo agregar si el sensor tiene datos para esa variable
          const series = sensor.Lecturas
            .filter(lectura => lectura.datos_sensor[variable] !== undefined && lectura.datos_sensor[variable] !== null)
            .map(lectura => ({
              name: new Date(lectura.fecha_lectura),
              value: lectura.datos_sensor[variable]
            }));
          if (series.length > 0) {
            this.graficasVariables[variable].push({
              name: `${variable.charAt(0).toUpperCase() + variable.slice(1)} ${sensor.IdentificadorSensor}`,
              series
            });
          }
        });
      }
    });
  }

  getSeveridadColor(severidad: string): string {
    switch (severidad) {
      case 'alta':
        return '#f44336';
      case 'media':
        return '#ff9800';
      case 'baja':
        return '#4caf50';
      default:
        return '#757575';
    }
  }

  getSeveridadIcon(severidad: string): string {
    switch (severidad) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baja':
        return 'info';
      default:
        return 'notifications';
    }
  }

  getYAxisLabel(variable: string): string {
    switch (variable.toLowerCase()) {
      case 'temperatura':
        return 'Temperatura (°C)';
      case 'humedad':
        return 'Humedad (%)';
      case 'ph':
        return 'pH';
      default:
        return variable.charAt(0).toUpperCase() + variable.slice(1);
    }
  }

  getColorScheme(variable: string) {
    return this.colorSchemes[variable.toLowerCase()] || this.colorSchemes['default'];
  }
} 