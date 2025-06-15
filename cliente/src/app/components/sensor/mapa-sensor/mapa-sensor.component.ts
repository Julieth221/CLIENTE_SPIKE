import { Component, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mapa-sensor',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="mapa-container">
      <google-map #mapa
        [center]="center"
        [zoom]="zoom"
        (mapClick)="onMapClick($event)"
        height="400px"
        width="100%">
      </google-map>
      
      <!-- Información de la parcela -->
      <div class="parcela-info" *ngIf="mostrarDetalles">
        <p><strong>📍 {{ nombreParcela }}</strong></p>
        <p>Tamaño: {{ tamanoParcela | number:'1.2-2' }} ha</p>
      </div>

      <!-- Mensaje de estado -->
      <div class="status-message" [class.error]="showError" [class.success]="showSuccess">
        {{ statusMessage }}
      </div>
    </div>
  `,
  styles: [`
    .mapa-container {
      width: 100%;
      height: 400px;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    google-map {
      width: 100%;
      height: 100%;
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

    .status-message {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      border-radius: 4px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      font-size: 0.9rem;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .status-message.error {
      background-color: rgba(220, 53, 69, 0.9);
      opacity: 1;
    }

    .status-message.success {
      background-color: rgba(40, 167, 69, 0.9);
      opacity: 1;
    }
  `]
})
export class MapaSensorComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('mapa') mapa!: GoogleMap;
  
  @Input() coordenadas: {
    latitudInicial: number;
    longitudInicial: number;
    latitudFinal: number;
    longitudFinal: number;
  } = {
    latitudInicial: 4.570868,
    longitudInicial: -74.297333,
    latitudFinal: 4.580868,
    longitudFinal: -74.287333
  };
  
  @Input() nombreParcela: string = '';
  @Input() tamanoParcela: number = 0;
  @Input() mostrarDetalles: boolean = true;
  @Output() ubicacionSeleccionada = new EventEmitter<{lat: number, lng: number}>();
  
  // Configuración del mapa
  center: google.maps.LatLngLiteral = { lat: 4.570868, lng: -74.297333 };
  zoom = 14;
  
  // Elementos del mapa
  marcadores: google.maps.Marker[] = [];
  poligono: google.maps.Polygon | null = null;
  marcadorSensor: google.maps.Marker | null = null;
  private ultimasCoordenadas: any = null;
  private mapaInicializado = false;

  // Variables para mensajes de estado
  statusMessage: string = '';
  showError: boolean = false;
  showSuccess: boolean = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.center = this.calcularCentro();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
      this.mapaInicializado = true;
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['coordenadas'] && !changes['coordenadas'].firstChange && this.mapaInicializado) {
      const nuevasCoordenadas = changes['coordenadas'].currentValue;
      if (!this.sonCoordenadasIguales(this.ultimasCoordenadas, nuevasCoordenadas)) {
        this.ultimasCoordenadas = { ...nuevasCoordenadas };
        this.limpiarMapa();
        this.inicializarMapa();
      }
    }
  }

  private mostrarMensaje(mensaje: string, esError: boolean = false) {
    this.statusMessage = mensaje;
    this.showError = esError;
    this.showSuccess = !esError;

    setTimeout(() => {
      this.statusMessage = '';
      this.showError = false;
      this.showSuccess = false;
    }, 3000);
  }
  
  private sonCoordenadasIguales(coords1: any, coords2: any): boolean {
    if (!coords1 || !coords2) return false;
    return (
      coords1.latitudInicial === coords2.latitudInicial &&
      coords1.longitudInicial === coords2.longitudInicial &&
      coords1.latitudFinal === coords2.latitudFinal &&
      coords1.longitudFinal === coords2.longitudFinal
    );
  }

  private ajustarZoom(vertices: google.maps.LatLngLiteral[]) {
    const mapaInstancia = this.mapa?.googleMap;
    if (!mapaInstancia) return;

    const bounds = new google.maps.LatLngBounds();
    vertices.forEach(vertex => bounds.extend(vertex));
    
    // Agregar un pequeño margen al bounds para mejor visualización
    const padding = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    };
    
    mapaInstancia.fitBounds(bounds, padding);
    
    // Ajustar el zoom máximo para que no se aleje demasiado
    const MAX_ZOOM = 18;
    google.maps.event.addListenerOnce(mapaInstancia, 'idle', () => {
      const currentZoom = mapaInstancia.getZoom();
      if (currentZoom !== undefined && currentZoom > MAX_ZOOM) {
        mapaInstancia.setZoom(MAX_ZOOM);
      }
    });
  }
  
  inicializarMapa() {
    if (!this.mapa || !this.mapa.googleMap) {
      console.warn('El mapa no está disponible aún');
      return;
    }
    
    try {
      console.log('Inicializando mapa con coordenadas:', this.coordenadas);
      this.center = this.calcularCentro();
      this.mapa.googleMap.setCenter(this.center);
      
      const vertices = this.calcularVertices();
      console.log('Vértices del polígono:', vertices);
      
      // Dibujar el polígono primero
      this.dibujarPoligono(vertices);
      
      // Agregar marcadores en las esquinas
      vertices.forEach((vertice) => {
        const marcador = new google.maps.Marker({
          position: vertice,
          map: this.mapa.googleMap,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#FF0000',
            fillOpacity: 0.8,
            strokeWeight: 1,
            strokeColor: '#FFFFFF'
          }
        });
        
        this.marcadores.push(marcador);
      });

      // Ajustar el zoom después de dibujar todo
      this.ajustarZoom(vertices);

      // Agregar listener para clics en el mapa
      this.mapa.googleMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        console.log('Clic en el mapa detectado');
        this.onMapClick(event);
      });

      this.mostrarMensaje('Mapa inicializado correctamente', false);
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
      this.mostrarMensaje('Error al inicializar el mapa', true);
    }
  }
  
  calcularVertices(): google.maps.LatLngLiteral[] {
    const { latitudInicial, longitudInicial, latitudFinal, longitudFinal } = this.coordenadas;
    
    return [
      { lat: latitudInicial, lng: longitudInicial },
      { lat: latitudInicial, lng: longitudFinal },
      { lat: latitudFinal, lng: longitudFinal },
      { lat: latitudFinal, lng: longitudInicial }
    ];
  }
  
  calcularCentro(): google.maps.LatLngLiteral {
    const { latitudInicial, longitudInicial, latitudFinal, longitudFinal } = this.coordenadas;
    
    return {
      lat: (latitudInicial + latitudFinal) / 2,
      lng: (longitudInicial + longitudFinal) / 2
    };
  }
  
  dibujarPoligono(vertices: google.maps.LatLngLiteral[]) {
    if (!this.mapa || !this.mapa.googleMap || vertices.length < 3) {
      console.warn('No se puede dibujar el polígono: mapa no disponible o vértices insuficientes');
      return;
    }
    
    try {
      this.poligono = new google.maps.Polygon({
        paths: vertices,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: this.mapa.googleMap,
        clickable: false // Desactivar la interactividad del polígono
      });

      this.mostrarMensaje('Polígono dibujado correctamente', false);
    } catch (error) {
      console.error('Error al dibujar el polígono:', error);
      this.mostrarMensaje('Error al dibujar el polígono', true);
    }
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (!event.latLng || !this.mapa?.googleMap) {
      console.error('No se puede procesar el clic: mapa o coordenadas no disponibles');
      this.mostrarMensaje('No se puede procesar la selección en este momento', true);
      return;
    }

    try {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      console.log('Coordenadas del clic:', { lat, lng });

      // Verificar si el punto está dentro del área de la parcela
      const estaDentro = this.estaDentroDelPoligono(lat, lng);
      console.log('¿Está dentro del área?:', estaDentro);

      if (estaDentro) {
        console.log('Creando marcador en posición:', { lat, lng });
        
        // Eliminar marcador anterior si existe
        if (this.marcadorSensor) {
          console.log('Eliminando marcador anterior');
          this.marcadorSensor.setMap(null);
        }

        // Crear nuevo marcador
        const position = { lat, lng };
        this.marcadorSensor = new google.maps.Marker({
          position: position,
          map: this.mapa.googleMap,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
          },
          animation: google.maps.Animation.DROP,
          zIndex: 1000 // Asegurar que el marcador esté por encima del polígono
        });

        // Emitir las coordenadas seleccionadas
        console.log('Emitiendo coordenadas:', position);
        this.ubicacionSeleccionada.emit(position);
        this.mostrarMensaje('Ubicación seleccionada correctamente', false);
      } else {
        console.log('Punto fuera del área de la parcela');
        this.mostrarMensaje('El punto seleccionado está fuera del área de la parcela', true);
      }
    } catch (error) {
      console.error('Error al procesar el clic en el mapa:', error);
      this.mostrarMensaje('Error al procesar la selección', true);
    }
  }

  private estaDentroDelPoligono(lat: number, lng: number): boolean {
    const { latitudInicial, longitudInicial, latitudFinal, longitudFinal } = this.coordenadas;
    
    // Calcular los límites del rectángulo con un margen de tolerancia más pequeño
    const margen = 0.00001; // Aproximadamente 1.1 metros
    const minLat = Math.min(latitudInicial, latitudFinal) - margen;
    const maxLat = Math.max(latitudInicial, latitudFinal) + margen;
    const minLng = Math.min(longitudInicial, longitudFinal) - margen;
    const maxLng = Math.max(longitudInicial, longitudFinal) + margen;

    // Verificar si el punto está dentro de los límites
    const estaDentro = lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    
    console.log('Validación de coordenadas:', {
      punto: { lat, lng },
      limites: { minLat, maxLat, minLng, maxLng },
      coordenadasOriginales: this.coordenadas,
      estaDentro,
      distanciaLat: {
        min: Math.abs(lat - minLat),
        max: Math.abs(lat - maxLat)
      },
      distanciaLng: {
        min: Math.abs(lng - minLng),
        max: Math.abs(lng - maxLng)
      }
    });

    return estaDentro;
  }
  
  limpiarMapa() {
    try {
      this.marcadores.forEach(marcador => {
        marcador.setMap(null);
      });
      this.marcadores = [];
      
      if (this.marcadorSensor) {
        this.marcadorSensor.setMap(null);
        this.marcadorSensor = null;
      }
      
      if (this.poligono) {
        this.poligono.setMap(null);
        this.poligono = null;
      }
    } catch (error) {
      console.error('Error al limpiar el mapa:', error);
      this.mostrarMensaje('Error al limpiar el mapa', true);
    }
  }
} 