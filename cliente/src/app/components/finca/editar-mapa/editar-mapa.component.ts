import { AfterViewInit, Component, EventEmitter, Input, OnChanges, ViewChild, Output, SimpleChanges, OnDestroy } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Coordenadas {
  IdGeolocalizacion?: number;
  latitudInicial: number;
  longitudInicial: number;
  latitudFinal: number;
  longitudFinal: number;
}

@Component({
  selector: 'app-editar-mapa',
  imports: [
    GoogleMapsModule,
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './editar-mapa.component.html',
  styleUrl: './editar-mapa.component.css'
})
export class EditarMapaComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapa') mapa!: GoogleMap;
  @Input() editable: boolean = false;
  @Input() coordenadas!: Coordenadas;
  
  @Output() onGeolocalizacionEditada = new EventEmitter<Coordenadas>();

  private destroy$ = new Subject<void>();
  private isInitialized = false;
  private coordenadasTemporales: Coordenadas | null = null;

  center: google.maps.LatLngLiteral = { lat: 4.570868, lng: -74.297333 };
  zoom = 14;
  marcadores: google.maps.Marker[] = [];
  poligono: google.maps.Polygon | null = null;
  coordenadasActualizadas: Coordenadas | null = null;
  bounds: google.maps.LatLngBounds | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['coordenadas'] && !changes['coordenadas'].firstChange) {
      this.procesarCoordenadas();
    }
  }

  ngAfterViewInit() {
    if (this.coordenadas) {
      this.procesarCoordenadas();
    } else {
      console.warn("No se han recibido coordenadas.");
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.limpiarMapa();
  }

  private limpiarMapa() {
    if (this.marcadores.length > 0) {
      this.marcadores.forEach(marker => marker.setMap(null));
      this.marcadores = [];
    }
    if (this.poligono) {
      this.poligono.setMap(null);
      this.poligono = null;
    }
  }

  private procesarCoordenadas() {
    if (!this.coordenadas || !this.mapa?.googleMap) {
      console.warn("Coordenadas o mapa no disponibles");
      return;
    }

    try {
      const coords = this.normalizarCoordenadas(this.coordenadas);
      
      if (this.validarCoordenadas(coords)) {
        this.center = this.calcularCentro(coords);
        this.mapa.googleMap.setCenter(this.center);
        this.agregarMarcadoresYPoligono(coords);
        this.isInitialized = true;
        this.coordenadasTemporales = { ...coords };
      } else {
        console.error("Coordenadas inválidas:", coords);
      }
    } catch (error) {
      console.error("Error al procesar coordenadas:", error);
    }
  }

  private normalizarCoordenadas(coords: any): Coordenadas {
    return {
      IdGeolocalizacion: coords.IdGeolocalizacion,
      latitudInicial: this.parsearCoordenada(coords.LatitudInicial || coords.latitudInicial),
      longitudInicial: this.parsearCoordenada(coords.LongitudInicial || coords.longitudInicial),
      latitudFinal: this.parsearCoordenada(coords.LatitudFinal || coords.latitudFinal),
      longitudFinal: this.parsearCoordenada(coords.LongitudFinal || coords.longitudFinal)
    };
  }

  private parsearCoordenada(valor: any): number {
    if (typeof valor === 'string') {
      const parsed = parseFloat(valor);
      if (isNaN(parsed)) {
        throw new Error(`Valor de coordenada inválido: ${valor}`);
      }
      return parsed;
    }
    if (typeof valor !== 'number' || isNaN(valor)) {
      throw new Error(`Valor de coordenada inválido: ${valor}`);
    }
    return valor;
  }

  private validarCoordenadas(coords: Coordenadas): boolean {
    return !isNaN(coords.latitudInicial) && 
           !isNaN(coords.longitudInicial) && 
           !isNaN(coords.latitudFinal) && 
           !isNaN(coords.longitudFinal) &&
           coords.latitudInicial >= -90 && coords.latitudInicial <= 90 &&
           coords.latitudFinal >= -90 && coords.latitudFinal <= 90 &&
           coords.longitudInicial >= -180 && coords.longitudInicial <= 180 &&
           coords.longitudFinal >= -180 && coords.longitudFinal <= 180;
  }

  private calcularCentro(coords: Coordenadas): google.maps.LatLngLiteral {
    return {
      lat: (coords.latitudInicial + coords.latitudFinal) / 2,
      lng: (coords.longitudInicial + coords.longitudFinal) / 2
    };
  }

  private calcularVertices(coords: Coordenadas): google.maps.LatLngLiteral[] {
    return [
      { lat: coords.latitudInicial, lng: coords.longitudInicial },
      { lat: coords.latitudInicial, lng: coords.longitudFinal },
      { lat: coords.latitudFinal, lng: coords.longitudFinal },
      { lat: coords.latitudFinal, lng: coords.longitudInicial }
    ];
  }

  private agregarMarcadoresYPoligono(coords: Coordenadas) {
    if (!this.mapa?.googleMap) return;

    this.limpiarMapa();
    const mapInstance = this.mapa.googleMap;
    const vertices = this.calcularVertices(coords);

    // Crear marcadores
    vertices.forEach((pos, index) => {
      const marker = new google.maps.Marker({
        position: pos,
        map: mapInstance,
        draggable: this.editable,
        title: `Vértice ${index + 1}`
      });

      if (this.editable) {
        marker.addListener('dragend', () => {
          this.actualizarPoligonoYEmitir(marker, index);
        });
      }

      this.marcadores.push(marker);
    });

    // Crear polígono
    this.poligono = new google.maps.Polygon({
      paths: vertices,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: mapInstance
    });

    // Ajustar zoom
    this.ajustarZoom(vertices);
  }

  private ajustarZoom(vertices: google.maps.LatLngLiteral[]) {
    const mapaInstancia = this.mapa?.googleMap;
    if (!mapaInstancia) return;

    const bounds = new google.maps.LatLngBounds();
    vertices.forEach(vertex => bounds.extend(vertex));
    
    mapaInstancia.fitBounds(bounds);
    
    const MAX_ZOOM = 16;
    google.maps.event.addListenerOnce(mapaInstancia, 'idle', () => {
      const currentZoom = mapaInstancia.getZoom();
      if (currentZoom !== undefined && currentZoom > MAX_ZOOM) {
        mapaInstancia.setZoom(MAX_ZOOM);
      }
    });
  }

  private actualizarPoligonoYEmitir(marker: google.maps.Marker, index: number) {
    if (!this.poligono || !this.mapa?.googleMap) return;

    try {
      const position = marker.getPosition();
      if (!position) throw new Error('Posición del marcador no disponible');

      const path = this.poligono.getPath();
      path.setAt(index, position);
      this.poligono.setPath(path);

      // Actualizar coordenadas temporales
      const coords = this.obtenerCoordenadasActualizadas();
      if (coords) {
        this.coordenadasTemporales = coords;
        this.coordenadasActualizadas = coords;
        
      }
    } catch (error) {
      console.error('Error al actualizar polígono:', error);
    }
  }

  private obtenerCoordenadasActualizadas(): Coordenadas | null {
    if (!this.poligono) return null;

    try {
      const path = this.poligono.getPath();
      const vertices = Array.from({ length: path.getLength() }, (_, i) => path.getAt(i));
      
      const latitudes = vertices.map(v => v.lat());
      const longitudes = vertices.map(v => v.lng());

      return {
        IdGeolocalizacion: this.coordenadas?.IdGeolocalizacion,
        latitudInicial: Math.min(...latitudes),
        latitudFinal: Math.max(...latitudes),
        longitudInicial: Math.min(...longitudes),
        longitudFinal: Math.max(...longitudes)
      };
    } catch (error) {
      console.error('Error al obtener coordenadas actualizadas:', error);
      return null;
    }
    
  }

  // Método público para guardar cambios
  guardarCambios() {
    if (this.coordenadasTemporales) {
      this.onGeolocalizacionEditada.emit(this.coordenadasTemporales);
    }
  }
}


