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
    if (!this.data.fincaId) {
      this.error = 'ID de finca no válido';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.parcelas = [];

    // 1. Obtener todos los arrendamientos asociados a esta finca
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (arrendamientosResponse: any) => {
          if (!arrendamientosResponse || !arrendamientosResponse.Data || !Array.isArray(arrendamientosResponse.Data)) {
            this.loading = false;
            this.error = 'Error al obtener los arrendamientos de la finca';
            return;
          }

          // Filtrar solo los arrendamientos de la finca actual que tienen parcelas asociadas
          const parcelasDeLaFinca = arrendamientosResponse.Data.filter((a: any) => 
            a.FkArrendamientoFinca && 
            a.FkArrendamientoFinca.Id === this.data.fincaId && 
            a.FkArrendatamientoParcela && 
            a.FkArrendatamientoParcela.Id
          );

          if (parcelasDeLaFinca.length === 0) {
            this.loading = false;
            this.error = 'Esta finca no tiene parcelas arrendadas';
            return;
          }

          // Extraer los IDs de parcelas únicas (evitar duplicados)
          const parcelasIds = [...new Set(parcelasDeLaFinca.map((a: any) => a.FkArrendatamientoParcela.Id))];

          // 2. Obtener detalles de cada parcela
          const parcelasRequests = parcelasIds.map((parcelaId: any) => 
            this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Parcela/${parcelaId}`)
          );

          if (parcelasRequests.length === 0) {
            this.loading = false;
            this.error = 'No se pudo obtener información de las parcelas';
            return;
          }

          // Procesar todas las solicitudes de parcelas en paralelo
          forkJoin(parcelasRequests)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (parcelasResponses: any) => {
                // Procesar cada respuesta de parcela
                const parcelasPromises = parcelasResponses.map((parcelaResponse: any, index: any) => {
                  if (!parcelaResponse || !parcelaResponse.Data) {
                    return Promise.resolve(null);
                  }

                  const parcela = parcelaResponse.Data;

                  // 3. Para cada parcela, buscar su información de geolocalización en FincaParcela
                  return new Promise<ParcelaDetalle | null>((resolve) => {
                    // Buscar el registro en FincaParcela que coincida con el ID de la parcela
                    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/FincaParcela?fkParcelaFinca=${parcela.Id}&activo=true`)
                      .pipe(takeUntil(this.destroy$))
                      .subscribe({
                        next: (fincaParcelaResponse: any) => {
                          if (!fincaParcelaResponse || !fincaParcelaResponse.Data || 
                              !Array.isArray(fincaParcelaResponse.Data) || 
                              fincaParcelaResponse.Data.length === 0) {
                            resolve(null);
                            return;
                          }

                          const fincaParcela = fincaParcelaResponse.Data[0];
                          
                          // 4. Si existe geolocalización, obtener sus detalles
                          if (fincaParcela.FkGeolocalizacion && fincaParcela.FkGeolocalizacion.Id) {
                            this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Geolocalizacion/${fincaParcela.FkGeolocalizacion.Id}`)
                              .subscribe({
                                next: (geoResponse: any) => {
                                  if (!geoResponse || !geoResponse.Data) {
                                    resolve({
                                      id: parcela.Id,
                                      nombre: parcela.NombreParcela || `Parcela ${index + 1}`,
                                      tamano: parcela.TamanoParcela || 0,
                                      coordenadas: {
                                        latitudInicial: 0,
                                        longitudInicial: 0,
                                        latitudFinal: 0,
                                        longitudFinal: 0
                                      }
                                    });
                                    return;
                                  }

                                  const geo = geoResponse.Data;
                                  resolve({
                                    id: parcela.Id,
                                    nombre: parcela.NombreParcela || `Parcela ${index + 1}`,
                                    tamano: parcela.TamanoParcela || 0,
                                    coordenadas: {
                                      latitudInicial: parseFloat(geo.LatitudInicial),
                                      longitudInicial: parseFloat(geo.LongitudInicial),
                                      latitudFinal: parseFloat(geo.LatitudFinal),
                                      longitudFinal: parseFloat(geo.LongitudFinal)
                                    }
                                  });
                                },
                                error: (err) => {
                                  console.error(`Error al obtener geolocalización para parcela ${parcela.Id}:`, err);
                                  resolve({
                                    id: parcela.Id,
                                    nombre: parcela.NombreParcela || `Parcela ${index + 1}`,
                                    tamano: parcela.TamanoParcela || 0,
                                    coordenadas: {
                                      latitudInicial: 0,
                                      longitudInicial: 0,
                                      latitudFinal: 0,
                                      longitudFinal: 0
                                    }
                                  });
                                }
                              });
                          } else {
                            resolve({
                              id: parcela.Id,
                              nombre: parcela.NombreParcela || `Parcela ${index + 1}`,
                              tamano: parcela.TamanoParcela || 0,
                              coordenadas: {
                                latitudInicial: 0,
                                longitudInicial: 0,
                                latitudFinal: 0,
                                longitudFinal: 0
                              }
                            });
                          }
                        },
                        error: (err) => {
                          console.error(`Error al obtener FincaParcela para parcela ${parcela.Id}:`, err);
                          resolve(null);
                        }
                      });
                  });
                });

                // Esperar a que todas las parcelas se procesen
                Promise.all(parcelasPromises).then(resultados => {
                  this.todasLasParcelas = resultados.filter(p => p !== null) as ParcelaDetalle[];
                  this.parcelas = this.todasLasParcelas;
                  this.loading = false;
                });
              },
              error: (err) => {
                console.error('Error al obtener detalles de parcelas:', err);
                this.loading = false;
                this.error = 'Error al obtener información detallada de las parcelas';
              }
            });
        },
        error: (err) => {
          console.error('Error al obtener arrendamientos:', err);
          this.loading = false;
          this.error = 'Error al buscar parcelas asociadas a la finca';
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
