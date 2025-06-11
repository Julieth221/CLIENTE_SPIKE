import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { RegistroEtapaDialog } from './registro-etapa-dialog.component';

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

interface FaseCultivo {
  Id: number;
  NombreFase: string;
  Activo: boolean;
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

interface EtapaFenologica {
  nombre: string;
  duracion: string;
  descripcion: string;
  caracteristicas: string[];
  recomendaciones: string[];
  icono: string;
}

@Component({
  selector: 'app-fases-cultivo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    // RegistroEtapaDialog
  ],
  templateUrl: './fases-cultivo.component.html',
  styleUrl: './fases-cultivo.component.css'
})
export class FasesCultivoComponent implements OnInit {
  cultivos: RegistroCultivo[] = [];
  cultivoSeleccionado: RegistroCultivo | null = null;
  fasesCultivo: FaseCultivo[] = [];
  cultivoFases: CultivoFase[] = [];
  loading: boolean = false;
  user_id: number | null = null;

  etapasFenologicas: EtapaFenologica[] = [
    {
      nombre: 'Germinación',
      duracion: '7 días',
      descripcion: 'Proceso inicial donde la semilla comienza a desarrollarse y emerge la plántula.',
      caracteristicas: ['Emergencia de la radícula', 'Desarrollo del coleóptilo', 'Primeras raíces adventicias'],
      recomendaciones: ['Mantener humedad constante', 'Temperatura óptima 25-30°C', 'Evitar encharcamiento'],
      icono: '🌱'
    },
    {
      nombre: 'Plántula',
      duracion: '8-14 días',
      descripcion: 'Desarrollo inicial de la planta con formación de hojas verdaderas.',
      caracteristicas: ['Desarrollo de hojas verdaderas', 'Crecimiento del sistema radicular', 'Formación de tallo'],
      recomendaciones: ['Control de malezas', 'Aplicación de fertilizante inicial', 'Manejo del nivel de agua'],
      icono: '🌿'
    },
    {
      nombre: 'Macollamiento',
      duracion: '15-20 días',
      descripcion: 'Desarrollo de tallos secundarios que aumentan la capacidad productiva de la planta.',
      caracteristicas: ['Formación de macollos', 'Incremento de la biomasa', 'Mayor demanda de nutrientes'],
      recomendaciones: ['Aplicar fertilizantes nitrogenados', 'Monitorear presencia de plagas', 'Mantener niveles adecuados de agua'],
      icono: '🌾'
    },
    {
      nombre: 'Elongación del Tallo',
      duracion: '10-15 días',
      descripcion: 'Crecimiento vertical del tallo principal y desarrollo de entrenudos.',
      caracteristicas: ['Alargamiento del tallo', 'Formación de entrenudos', 'Desarrollo de hojas superiores'],
      recomendaciones: ['Control de altura de agua', 'Aplicación de fertilizante foliar', 'Monitoreo de enfermedades'],
      icono: '📏'
    },
    {
      nombre: 'Iniciación de Panícula',
      duracion: '10-12 días',
      descripcion: 'Formación inicial de la estructura reproductiva de la planta.',
      caracteristicas: ['Diferenciación de la panícula', 'Desarrollo de primordios florales', 'Cambios en la estructura del tallo'],
      recomendaciones: ['Manejo preciso del agua', 'Control de temperatura', 'Aplicación de micronutrientes'],
      icono: '🌼'
    },
    {
      nombre: 'Floración',
      duracion: '7-10 días',
      descripcion: 'Apertura de las flores y proceso de polinización.',
      caracteristicas: ['Apertura de espiguillas', 'Polinización', 'Desarrollo de ovarios'],
      recomendaciones: ['Evitar estrés hídrico', 'Control de temperatura', 'Protección contra vientos fuertes'],
      icono: '🌸'
    },
    {
      nombre: 'Grano Lechoso',
      duracion: '7-10 días',
      descripcion: 'Desarrollo inicial del grano con contenido líquido lechoso.',
      caracteristicas: ['Formación del endospermo', 'Acumulación de almidón', 'Desarrollo del embrión'],
      recomendaciones: ['Manejo del nivel de agua', 'Control de aves', 'Monitoreo de madurez'],
      icono: '🥛'
    },
    {
      nombre: 'Grano Pastoso',
      duracion: '7-10 días',
      descripcion: 'Transición del grano de estado líquido a sólido.',
      caracteristicas: ['Endurecimiento del grano', 'Cambio de color', 'Acumulación de reservas'],
      recomendaciones: ['Reducción gradual del agua', 'Control de plagas de grano', 'Preparación para cosecha'],
      icono: '🍚'
    },
    {
      nombre: 'Grano Maduro',
      duracion: '10-15 días',
      descripcion: 'Maduración completa del grano y preparación para cosecha.',
      caracteristicas: ['Secado del grano', 'Cambio de color a dorado', 'Separación de la panícula'],
      recomendaciones: ['Planificación de cosecha', 'Control de humedad', 'Preparación de maquinaria'],
      icono: '🌾'
    }
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
        this.snackBar.open('Error al cargar los cultivos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onCultivoSeleccionado(cultivoId: number): void {
    this.cultivoSeleccionado = this.cultivos.find(c => c.Id === cultivoId) || null;
    if (this.cultivoSeleccionado) {
      this.cargarFasesCultivo();
    }
  }

  cargarFasesCultivo(): void {
    if (!this.cultivoSeleccionado) return;

    this.loading = true;
    this.apiService.get<CultivoFase[]>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Cultivo_Fase?query=FkCultivoFase.Id:${this.cultivoSeleccionado.Id}`).subscribe({
      next: (response: any) => {
        this.cultivoFases = response.Data.map((fase: any) => ({
          Id: fase.Id,
          FkCultivoFase: {
            Id: fase.FkCultivoFase?.Id || 0
          },
          FkFaseCultivo: {
            Id: fase.FkFaseCultivo?.Id || 0,
            NombreFase: fase.FkFaseCultivo?.NombreFase || ''
          },
          FechaInicio: fase.FechaInicio || '',
          FechaFin: fase.FechaFin || '',
          Observaciones: fase.Observaciones || '',
          Completada: fase.Completada || false,
          Activo: fase.Activo || false
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar fases del cultivo:', error);
        this.snackBar.open('Error al cargar las fases del cultivo', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getEstadoFase(nombreFase: string): { estado: 'completado' | 'en-progreso' | 'no-iniciado', fecha?: string } {
    const fase = this.cultivoFases.find(f => 
      f.FkFaseCultivo.NombreFase.toLowerCase() === nombreFase.toLowerCase()
    );

    if (!fase) return { estado: 'no-iniciado' };
    if (fase.Completada) return { estado: 'completado', fecha: fase.FechaFin };
    return { estado: 'en-progreso', fecha: fase.FechaInicio };
  }

  getFaseId(nombreFase: string): number {
    const fase = this.cultivoFases.find(f => 
      f.FkFaseCultivo.NombreFase.toLowerCase() === nombreFase.toLowerCase()
    );
    return fase?.Id || 0;
  }

  verDetalles(etapa: EtapaFenologica): void {
    this.dialog.open(DetallesFaseDialog, {
      width: '600px',
      data: etapa
    });
  }

  registrarFase(nombreFase: string): void {
    const etapa = this.etapasFenologicas.find(e => e.nombre.toLowerCase() === nombreFase.toLowerCase());
    if (!etapa) return;

    const dialogRef = this.dialog.open(RegistroEtapaDialog, {
      width: '500px',
      data: etapa
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("Nombre de la fase: ", nombreFase);
        // Primero verificar si existe la fase
        this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Fase_Cultivo?query=NombreFase:${nombreFase.toLowerCase()}`).subscribe({
          next: (response: any) => {
            console.log("Respuesta de búsqueda de fase:", response);
            
            // Verificar si hay datos válidos en la respuesta
            const faseExistente = response.Data && 
                                response.Data.length > 0 && 
                                response.Data[0] && 
                                response.Data[0].Id;
            
            if (faseExistente) {
              // Si la fase existe, usar su ID
              const faseId = response.Data[0].Id;
              console.log("ID de fase existente:", faseId);
              this.crearCultivoFase(faseId, result);
            } else {
              console.log("No se encontró fase existente, creando nueva fase...");
              // Si no existe, crear la fase
              const nuevaFase = {
                NombreFase: nombreFase.toLowerCase(),
                Activo: true
              };

              console.log("Body para crear nueva fase:", nuevaFase);
              
              this.apiService.post(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Fase_Cultivo`, nuevaFase).subscribe({
                next: (faseResponse: any) => {
                  console.log("Respuesta de creación de fase:", faseResponse);
                  
                  if (faseResponse.Success && faseResponse.Data && faseResponse.Data.Id) {
                    const faseId = faseResponse.Data.Id;
                    console.log("ID de fase creada:", faseId);
                    this.crearCultivoFase(faseId, result);
                  } else {
                    console.error('Error: No se recibió ID de fase en la respuesta', faseResponse);
                    this.snackBar.open('Error al crear la fase: No se recibió ID', 'Cerrar', { duration: 3000 });
                  }
                },
                error: (error) => {
                  console.error('Error al crear fase:', error);
                  this.snackBar.open('Error al crear la fase', 'Cerrar', { duration: 3000 });
                }
              });
            }
          },
          error: (error) => {
            console.error('Error al verificar fase:', error);
            this.snackBar.open('Error al verificar la fase', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  private crearCultivoFase(faseId: number, datos: any): void {
    if (!this.cultivoSeleccionado) {
      console.error('No hay cultivo seleccionado');
      return;
    }

    if (!faseId) {
      console.error('ID de fase no válido:', faseId);
      this.snackBar.open('Error: ID de fase no válido', 'Cerrar', { duration: 3000 });
      return;
    }

    const cultivoFase = {
      FkCultivoFase: {
        Id: this.cultivoSeleccionado.Id
      },
      FkFaseCultivo: {
        Id: faseId,
        NombreFase: this.etapasFenologicas.find(e => e.nombre.toLowerCase() === datos.nombreFase?.toLowerCase())?.nombre || ''
      },
      FechaInicio: datos.fechaInicio,
      FechaFin: datos.fechaFin,
      Observaciones: datos.observaciones || '',
      Completada: datos.completada,
      Activo: true
    };

    console.log("Body para crear Cultivo_Fase:", cultivoFase);

    this.apiService.post<any>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Cultivo_Fase`, cultivoFase).subscribe({
      next: (response) => {
        console.log("Respuesta de creación de Cultivo_Fase:", response);
        if (response.Success) {
          this.snackBar.open('Fase registrada exitosamente', 'Cerrar', { duration: 3000 });
          this.cargarFasesCultivo();
        } else {
          console.error('Error en la respuesta:', response);
          this.snackBar.open('Error al registrar la fase: ' + (response.Message || 'Error desconocido'), 'Cerrar', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error al registrar fase:', error);
        this.snackBar.open('Error al registrar la fase', 'Cerrar', { duration: 3000 });
      }
    });
  }

  completarFase(faseId: number): void {
    const cultivoFase = this.cultivoFases.find(f => f.Id === faseId);
    if (!cultivoFase) return;

    const faseActualizada = {
      ...cultivoFase,
      FechaFin: new Date().toISOString().split('T')[0],
      Completada: true
    };

    this.apiService.put<CultivoFase>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Cultivo_Fase/${faseId}`, faseActualizada).subscribe({
      next: () => {
        this.snackBar.open('Fase completada exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarFasesCultivo();
      },
      error: (error) => {
        console.error('Error al completar fase:', error);
        this.snackBar.open('Error al completar la fase', 'Cerrar', { duration: 3000 });
      }
    });
  }
}

@Component({
  selector: 'detalles-fase-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <span class="etapa-icon">{{ data.icono }}</span>
        {{ data.nombre }}
      </h2>
      
      <mat-dialog-content>
        <div class="info-section">
          <div class="info-item">
            <mat-icon>schedule</mat-icon>
            <div class="info-content">
              <h3>Duración estimada</h3>
              <p>{{ data.duracion }}</p>
            </div>
          </div>

          <div class="info-item">
            <mat-icon>description</mat-icon>
            <div class="info-content">
              <h3>Descripción</h3>
              <p>{{ data.descripcion }}</p>
            </div>
          </div>
        </div>

        <div class="details-section">
          <div class="detail-group">
            <h3><mat-icon>check_circle</mat-icon> Características</h3>
            <ul>
              <li *ngFor="let caracteristica of data.caracteristicas">
                {{ caracteristica }}
              </li>
            </ul>
          </div>

          <div class="detail-group">
            <h3><mat-icon>lightbulb</mat-icon> Recomendaciones</h3>
            <ul>
              <li *ngFor="let recomendacion of data.recomendaciones">
                {{ recomendacion }}
              </li>
            </ul>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-raised-button color="primary" mat-dialog-close>
          <mat-icon>close</mat-icon>
          Cerrar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      max-width: 600px;
    }

    .etapa-icon {
      font-size: 1.5em;
      margin-right: 10px;
    }

    .info-section {
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .info-item mat-icon {
      color: #2196f3;
      margin-right: 16px;
      margin-top: 4px;
    }

    .info-content h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1em;
    }

    .info-content p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }

    .details-section {
      display: grid;
      gap: 24px;
    }

    .detail-group {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
    }

    .detail-group h3 {
      display: flex;
      align-items: center;
      margin: 0 0 16px 0;
      color: #333;
    }

    .detail-group h3 mat-icon {
      color: #4caf50;
      margin-right: 8px;
    }

    .detail-group ul {
      margin: 0;
      padding-left: 24px;
    }

    .detail-group li {
      margin-bottom: 8px;
      color: #666;
      line-height: 1.5;
    }

    mat-dialog-actions {
      padding: 16px 0 0;
    }

    button[mat-raised-button] {
      min-width: 120px;
    }

    mat-icon {
      margin-right: 8px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class DetallesFaseDialog {
  constructor(
    public dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: EtapaFenologica
  ) {}
}
