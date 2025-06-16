import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InicioDashboardCardComponent } from './inicio-dashboard-card/inicio-dashboard-card.component';
import { InicioDashboardChartComponent } from './inicio-dashboard-chart/inicio-dashboard-chart.component';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { API_URLS } from '../../../config/api_config';

interface DashboardMetrics {
  fincasCount: number;
  parcelasCount: number;
  arrendamientosActivosCount: number;
  cultivosCount: number;
  sensoresCount: number;
}

interface ApiResponse<T> {
  Data: T | T[];
  Message: string;
  Status: string;
  Success: boolean;
}

interface Finca {
  Id: number;
  FkFinca: {
    Id: number;
    Nombre: string;
    Id_Usuario: number;
    Activo: boolean;
  };
  Nombre: string;
  AreaTotal: number;
  TotalParcelas: number;
  TamañoParcelas: number;
  Id_Usuario: number;
  Activo: boolean;
}

interface Parcela {
  Id: number;
  FkFincaParcela: {
    Id: number;
    FkFinca: {
      Id: number;
      Nombre: string;
      Id_Usuario: number;
      Activo: boolean;
    };
    Nombre: string;
    Id_Usuario: number;
    Activo: boolean;
  };
  NombreParcela: string;
  TamanoParcela: number;
  Activo: boolean;
}

interface Arrendamiento {
  Id: number;
  FkArrendamientoFinca: {
    Id: number;
    FkFinca: {
      Id: number;
      Nombre: string;
      Id_Usuario: number;
      Activo: boolean;
    };
    Nombre: string;
    Id_Usuario: number;
    Activo: boolean;
  };
  Activo: boolean;
  FechaInicio: string;
  FechaFin: string;
  IdUserUserArrendatario: {
    Id: number;
    Nombre: string;
    Contacto: string;
    Id_Usuario: number;
    TipoDocumento: number;
    NumeroDocumento: string;
    Activo: boolean;
  };
}

interface RegistroCultivo {
  Id: number;
  Id_Arrendamiento: number;
  Id_Parcela: number;
  Nombre: string;
  FechaSiembra: string;
  Activo: boolean;
  Id_Usuario: number;
}

interface Sensor {
  Id: number;
  FkCultivo: number;
  Activo: boolean;
  FkUsuario: number;
  IdentificadorSensor: string;
}

@Component({
  selector: 'app-inicio-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    InicioDashboardCardComponent,
    InicioDashboardChartComponent
  ],
  templateUrl: './inicio-dashboard.component.html',
  styleUrl: './inicio-dashboard.component.css'
})
export class InicioDashboardComponent implements OnInit {
  userRole: string = '';
  userDocument: string = '';
  userId: number = 0;
  loading: boolean = true;
  error: string | null = null;
  metrics: DashboardMetrics = {
    fincasCount: 0,
    parcelasCount: 0,
    arrendamientosActivosCount: 0,
    cultivosCount: 0,
    sensoresCount: 0
  };

  chartData: { name: string; value: number }[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  private loadUserInfo() {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.userRole = userInfo.role;
      this.userDocument = userInfo.numeroDocumento;
      this.userId = this.authService.getUserId() || 0;
      this.loadMetrics();
    } else {
      this.error = 'No se pudo obtener la información del usuario';
      this.loading = false;
    }
  }

  private loadMetrics() {
    this.loading = true;
    this.error = null;

    const requests = [];

    if (this.userRole === 'ADMIN') {
      requests.push(
        this.loadFincasCount(),
        this.loadParcelasCount(),
        this.loadArrendamientosActivosCount(),
        this.loadCultivosCount(),
        this.loadSensoresCount()
      );
    } else if (this.userRole === 'PROPIETARIO') {
      requests.push(
        this.loadFincasCount(),
        this.loadParcelasCount(),
        this.loadArrendamientosActivosCount(),
        this.loadCultivosCount(),
        this.loadSensoresCount()
      );
    } else if (this.userRole === 'ARRENDATARIO') {
      requests.push(
        this.loadArrendamientosActivosByArrendatario(),
        this.loadCultivosCount(),
        this.loadSensoresCount()
      );
    }

    Promise.all(requests)
      .then(() => {
        this.prepareChartData();
        this.loading = false;
      })
      .catch(error => {
        this.error = 'Error al cargar las métricas';
        this.loading = false;
        console.error('Error:', error);
      });
  }

  private async loadFincasCount() {
    try {
      const response = await this.apiService.get<ApiResponse<Finca[]>>(`${API_URLS.CRUD.API_CRUD_FINCA}/Finca`).toPromise();
      if (response?.Data && Array.isArray(response.Data)) {
        const fincas = response.Data as Finca[];
        this.metrics.fincasCount = fincas.filter(finca => 
          finca.Activo && 
          (this.userRole === 'ADMIN' || finca.Id_Usuario === this.userId)
        ).length;
      }
    } catch (error) {
      console.error('Error loading fincas count:', error);
    }
  }

  private async loadParcelasCount() {
    try {
      const response = await this.apiService.get<ApiResponse<Parcela[]>>(`${API_URLS.CRUD.API_CRUD_FINCA}/Parcela`).toPromise();
      if (response?.Data && Array.isArray(response.Data)) {
        const parcelas = response.Data as Parcela[];
        this.metrics.parcelasCount = parcelas.filter(parcela => 
          parcela.Activo && 
          (this.userRole === 'ADMIN' || 
           (parcela.FkFincaParcela && 
            parcela.FkFincaParcela.FkFinca && 
            parcela.FkFincaParcela.FkFinca.Id_Usuario === this.userId))
        ).length;
      }
    } catch (error) {
      console.error('Error loading parcelas count:', error);
    }
  }

  private async loadArrendamientosActivosCount() {
    try {
      const response = await this.apiService.get<Arrendamiento[]>(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento`).toPromise();
      if (response) {
        const now = new Date();
        
        const arrendamientosActivos = response.filter(arrendamiento => {
          const fechaInicio = new Date(arrendamiento.FechaInicio);
          const fechaFin = new Date(arrendamiento.FechaFin);
          
          // Verificar que el arrendamiento esté activo y dentro del rango de fechas
          const esActivo = arrendamiento.Activo && 
                          now >= fechaInicio && 
                          now <= fechaFin;

          if (this.userRole === 'PROPIETARIO') {
            // Para PROPIETARIO, verificar que la finca del arrendamiento pertenezca al usuario
            return esActivo && 
                   arrendamiento.FkArrendamientoFinca?.FkFinca?.Id_Usuario === this.userId;
          } else if (this.userRole === 'ARRENDATARIO') {
            // Para ARRENDATARIO, verificar que el arrendatario sea el usuario actual
            return esActivo && 
                   arrendamiento.IdUserUserArrendatario?.Id_Usuario === this.userId;
          } else if (this.userRole === 'ADMIN') {
            // Para ADMIN, mostrar todos los arrendamientos activos
            return esActivo;
          }
          
          return false;
        });

        this.metrics.arrendamientosActivosCount = arrendamientosActivos.length;
      }
    } catch (error) {
      console.error('Error al cargar arrendamientos activos:', error);
      this.error = 'Error al cargar arrendamientos activos';
    }
  }

  private async loadArrendamientosActivosByArrendatario() {
    try {
      const response = await this.apiService.get<ApiResponse<Arrendamiento[]>>(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento`).toPromise();
      if (response?.Data && Array.isArray(response.Data)) {
        const arrendamientos = response.Data as Arrendamiento[];
        const hoy = new Date();
        this.metrics.arrendamientosActivosCount = arrendamientos.filter(arrendamiento => 
          arrendamiento.Activo && 
          new Date(arrendamiento.FechaInicio) <= hoy && 
          new Date(arrendamiento.FechaFin) >= hoy &&
          arrendamiento.IdUserUserArrendatario?.NumeroDocumento === this.userDocument
        ).length;
      }
    } catch (error) {
      console.error('Error loading arrendamientos by arrendatario:', error);
    }
  }

  private async loadCultivosCount() {
    try {
      const response = await this.apiService.get<ApiResponse<RegistroCultivo[]>>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Registro_Cultivo`).toPromise();
      if (response?.Data && Array.isArray(response.Data)) {
        const cultivos = response.Data as RegistroCultivo[];
        this.metrics.cultivosCount = cultivos.filter(cultivo => 
          cultivo.Activo && (this.userRole === 'ADMIN' || cultivo.Id_Usuario === this.userId)
        ).length;
      }
    } catch (error) {
      console.error('Error loading cultivos count:', error);
    }
  }

  private async loadSensoresCount() {
    try {
      const response = await this.apiService.get<ApiResponse<Sensor[]>>(`${API_URLS.CRUD.API_CRUD_SENSORES}/Sensor`).toPromise();
      if (response?.Data && Array.isArray(response.Data)) {
        const sensores = response.Data as Sensor[];
        this.metrics.sensoresCount = sensores.filter(sensor => 
          sensor.Activo && (this.userRole === 'ADMIN' || sensor.FkUsuario === this.userId)
        ).length;
      }
    } catch (error) {
      console.error('Error loading sensores count:', error);
    }
  }

  private prepareChartData() {
    if (this.userRole === 'ADMIN') {
      this.chartData = [
        { name: 'Fincas', value: this.metrics.fincasCount },
        { name: 'Parcelas', value: this.metrics.parcelasCount },
        { name: 'Arrendamientos', value: this.metrics.arrendamientosActivosCount },
        { name: 'Cultivos', value: this.metrics.cultivosCount },
        { name: 'Sensores', value: this.metrics.sensoresCount }
      ];
    } else if (this.userRole === 'PROPIETARIO') {
      this.chartData = [
        { name: 'Fincas', value: this.metrics.fincasCount },
        { name: 'Parcelas', value: this.metrics.parcelasCount },
        { name: 'Arrendamientos', value: this.metrics.arrendamientosActivosCount }
      ];
    } else if (this.userRole === 'ARRENDATARIO') {
      this.chartData = [
        { name: 'Arrendamientos', value: this.metrics.arrendamientosActivosCount },
        { name: 'Cultivos', value: this.metrics.cultivosCount },
        { name: 'Sensores', value: this.metrics.sensoresCount }
      ];
    }
  }
}
