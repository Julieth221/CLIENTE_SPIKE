import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface DialogData {
  geolocalizacionParcela: {
    lat_final: number;
    lat_inicial: number;
    lng_final: number;
    lng_inicial: number;
  };
  ubicacionSensor: {
    lat: number;
    lng: number;
  };
  identificadorSensor: string;
  nombreParcela: string;
}

@Component({
  selector: 'app-modal-mapa-sensor',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    GoogleMapsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="modal-container">
      <div class="modal-header">
        <h2 mat-dialog-title>
          <mat-icon>map</mat-icon>
          Ubicación del Sensor: {{ data.identificadorSensor }}
        </h2>
        <button mat-icon-button (click)="closeDialog()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="mapa-container">
          <google-map #mapa
            [center]="center"
            [zoom]="zoom"
            height="500px"
            width="100%">
          </google-map>

          <!-- Información de la parcela -->
          <div class="parcela-info">
            <p><strong>📍 {{ data.nombreParcela }}</strong></p>
            <p>Sensor: {{ data.identificadorSensor }}</p>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="closeDialog()">Cerrar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .modal-container {
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .modal-header h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      color: #2c3e50;
    }

    mat-dialog-content {
      flex: 1;
      overflow: hidden;
    }

    .mapa-container {
      position: relative;
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .parcela-info {
      position: absolute;
      top: 10px;
      left: 10px;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 8px 12px;
      border-radius: 6px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 10;
      font-size: 0.85rem;
      color: #333;
    }

    .parcela-info p {
      margin: 0;
      line-height: 1.4;
    }

    .parcela-info strong {
      color: #0e6f1c;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
      margin: 0;
    }
  `]
})
export class ModalMapaSensorComponent implements OnInit {
  @ViewChild('mapa') mapa!: GoogleMap;

  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 14;
  poligono: google.maps.Polygon | null = null;
  marcador: google.maps.Marker | null = null;

  constructor(
    public dialogRef: MatDialogRef<ModalMapaSensorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    this.center = this.calcularCentro();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 1000);
  }

  private calcularCentro(): google.maps.LatLngLiteral {
    const { lat_inicial, lat_final, lng_inicial, lng_final } = this.data.geolocalizacionParcela;
    return {
      lat: (lat_inicial + lat_final) / 2,
      lng: (lng_inicial + lng_final) / 2
    };
  }

  private calcularVertices(): google.maps.LatLngLiteral[] {
    const { lat_inicial, lat_final, lng_inicial, lng_final } = this.data.geolocalizacionParcela;
    return [
      { lat: lat_inicial, lng: lng_inicial },
      { lat: lat_inicial, lng: lng_final },
      { lat: lat_final, lng: lng_final },
      { lat: lat_final, lng: lng_inicial }
    ];
  }

  private inicializarMapa() {
    if (!this.mapa || !this.mapa.googleMap) {
      console.warn('El mapa no está disponible aún');
      return;
    }

    try {
      // Dibujar el polígono
      const vertices = this.calcularVertices();
      this.poligono = new google.maps.Polygon({
        paths: vertices,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: this.mapa.googleMap
      });

      // Agregar marcador del sensor
      this.marcador = new google.maps.Marker({
        position: this.data.ubicacionSensor,
        map: this.mapa.googleMap,
        title: this.data.identificadorSensor,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      // Ajustar el zoom para mostrar todo
      const bounds = new google.maps.LatLngBounds();
      vertices.forEach(vertex => bounds.extend(vertex));
      bounds.extend(this.data.ubicacionSensor);
      this.mapa.googleMap.fitBounds(bounds);

    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
} 