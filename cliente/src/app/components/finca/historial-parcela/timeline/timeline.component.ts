import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';

interface Arrendamiento {
  id: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  valor: string;
  arrendatario: string;
  parcelasAdicionales: string[];
}

interface VersionParcela {
  nombre: string;
  version: number;
  tamano: number;
  motivoCambio: string;
  fechaCreacion: string;
  arrendamientos: Arrendamiento[];
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule
  ],
  providers: [DatePipe],
  template: `
    <div class="timeline-container">
      <div class="timeline" *ngFor="let version of versiones; let i = index; trackBy: trackByVersion">
        <!-- Línea vertical -->
        <div class="timeline-line" *ngIf="i < versiones.length - 1"></div>
        
        <!-- Punto de la versión -->
        <div class="timeline-point version-point">
          <mat-icon>fiber_manual_record</mat-icon>
        </div>

        <!-- Contenido de la versión -->
        <div class="timeline-content">
          <mat-card class="version-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>landscape</mat-icon>
              <mat-card-title>
                {{ version.nombre }} - Versión {{ version.version }}
              </mat-card-title>
              <mat-card-subtitle>
                {{ formatDate(version.fechaCreacion) }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="motivo-cambio">
                <strong>Motivo del cambio:</strong> {{ version.motivoCambio }}
              </p>
              <p class="tamano">
                <strong>Tamaño:</strong> {{ version.tamano }} ha
              </p>
            </mat-card-content>
          </mat-card>

          <!-- Arrendamientos de esta versión -->
          <div class="arrendamientos-container">
            <div *ngIf="version.arrendamientos.length === 0" class="sin-arrendamientos">
              <mat-icon>info</mat-icon>
              <p>Sin arrendamientos registrados</p>
            </div>

            <div class="timeline-item" *ngFor="let arrendamiento of version.arrendamientos; trackBy: trackByArrendamiento">
              <!-- Línea horizontal -->
              <div class="timeline-line-horizontal"></div>
              
              <!-- Punto del arrendamiento -->
              <div class="timeline-point arrendamiento-point">
                <mat-icon>event</mat-icon>
              </div>

              <!-- Contenido del arrendamiento -->
              <mat-card class="arrendamiento-card">
                <mat-card-header>
                  <mat-icon mat-card-avatar>assignment</mat-icon>
                  <mat-card-title>
                    Arrendamiento {{ arrendamiento.id }}
                  </mat-card-title>
                  <mat-card-subtitle>
                    {{ formatDate(arrendamiento.fechaInicio) }} - {{ formatDate(arrendamiento.fechaFin) }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="arrendamiento-info">
                    <p class="valor">
                      <strong>Valor:</strong> {{ arrendamiento.valor | currency:'COP':'symbol-narrow':'1.0-0' }}
                    </p>
                    <p class="arrendatario">
                      <strong>Arrendatario:</strong> {{ arrendamiento.arrendatario }}
                    </p>
                    <p class="estado">
                      <strong>Estado:</strong>
                      <span class="estado-chip" [ngClass]="{
                        'estado-activo': arrendamiento.estado === 'Activo',
                        'estado-inactivo': arrendamiento.estado === 'Inactivo'
                      }">
                        {{ arrendamiento.estado }}
                      </span>
                    </p>
                    <div *ngIf="arrendamiento.parcelasAdicionales?.length" class="parcelas-adicionales">
                      <mat-icon class="warning-icon">warning</mat-icon>
                      <div class="parcelas-info">
                        <p class="parcelas-titulo">Incluye otras parcelas:</p>
                        <ul class="parcelas-lista">
                          <li *ngFor="let parcela of arrendamiento.parcelasAdicionales">
                            {{ parcela }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      padding: 20px;
      position: relative;
    }

    .timeline {
      position: relative;
      padding-left: 50px;
      margin-bottom: 30px;
    }

    .timeline-line {
      position: absolute;
      left: 24px;
      top: 40px;
      bottom: -30px;
      width: 2px;
      background-color: #1976d2;
    }

    .timeline-line-horizontal {
      position: absolute;
      left: -30px;
      top: 20px;
      width: 30px;
      height: 2px;
      background-color: #1976d2;
    }

    .timeline-point {
      position: absolute;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .version-point {
      top: 0;
      background-color: #1976d2;
    }

    .version-point mat-icon {
      color: white;
    }

    .arrendamiento-point {
      top: 20px;
      background-color: #e3f2fd;
    }

    .arrendamiento-point mat-icon {
      color: #1976d2;
    }

    .timeline-content {
      position: relative;
    }

    .version-card {
      margin-bottom: 20px;
      background-color: #f8f9fa;
    }

    .arrendamientos-container {
      padding-left: 20px;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 20px;
    }

    .arrendamiento-card {
      background-color: white;
    }

    .motivo-cambio,
    .tamano {
      color: #495057;
      margin: 0 0 8px 0;
    }

    .valor {
      color: #2e7d32;
      font-size: 1.1em;
      margin: 0 0 8px 0;
    }

    .arrendatario,
    .estado {
      color: #495057;
      margin: 0 0 8px 0;
    }

    .estado-chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      margin-left: 8px;
    }

    .estado-activo {
      background-color: #e3f2fd;
      color: #2e7d32;
    }

    .estado-inactivo {
      background-color: rgba(244, 67, 54, 0.1);
      color: #F44336;
    }

    .sin-arrendamientos {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin: 16px 0;
      color: #757575;
    }

    .sin-arrendamientos mat-icon {
      color: #757575;
    }

    .sin-arrendamientos p {
      margin: 0;
      font-size: 14px;
    }

    .arrendamiento-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .parcelas-adicionales {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background-color: #fff3e0;
      padding: 12px;
      border-radius: 8px;
      margin-top: 8px;
    }

    .warning-icon {
      color: #f57c00;
      margin-top: 2px;
    }

    .parcelas-info {
      flex: 1;
    }

    .parcelas-titulo {
      color: #f57c00;
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .parcelas-lista {
      margin: 0;
      padding-left: 20px;
      color: #666;
    }

    .parcelas-lista li {
      margin-bottom: 2px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      font-size: 1.1em;
      margin-bottom: 8px;
    }

    mat-card-subtitle {
      color: #666;
    }

    @media (max-width: 768px) {
      .timeline {
        padding-left: 40px;
      }

      .timeline-point {
        width: 36px;
        height: 36px;
      }

      .timeline-line {
        left: 18px;
      }

      .timeline-line-horizontal {
        left: -20px;
        width: 20px;
      }

      .parcelas-adicionales {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent {
  @Input() versiones: VersionParcela[] = [];

  constructor(private datePipe: DatePipe) {}

  formatDate(date: string): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') || '';
  }

  trackByVersion(index: number, version: VersionParcela): string {
    return `${version.nombre}-${version.version}`;
  }

  trackByArrendamiento(index: number, arrendamiento: Arrendamiento): number {
    return arrendamiento.id;
  }
} 