import { Component, EventEmitter, Output, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

// Definir la interfaz para el punto geográfico con estado de validez
interface SingleGeoPoint {
  Latitud: string;
  Longitud: string;
  isValid: boolean; // Añadido para indicar si la ubicación es válida dentro del polígono
}

@Component({
  selector: 'app-maps-sensor',
  standalone: true,
  imports: [
    GoogleMapsModule,
    CommonModule
  ],
  templateUrl: './maps-sensor.component.html',
  styleUrl: './maps-sensor.component.css'
})
export class MapsSensorComponent implements AfterViewInit, OnChanges {

  @ViewChild('map', { static: false }) map!: GoogleMap; // ¡CRÍTICO! Añadido @ViewChild para acceder a la instancia del mapa
  @Output() onGeolocalizacionChange = new EventEmitter<SingleGeoPoint>();

  @Input() cultivationPolygonCoords: google.maps.LatLngLiteral[] | null = null;
  @Input() sensorMarkerCoords: google.maps.LatLngLiteral | null = null;
  @Input() enableMapClickPlacement: boolean = true; // Nuevo input para controlar si se puede colocar el marcador con clic

  center = { lat: 4.570868, lng: -74.297333 }; // Centro predeterminado
  zoom = 12;
  geo: SingleGeoPoint | null = null; // Coordenadas del marcador del sensor

  // Usamos 'any' para el marcador para ser compatible con AdvancedMarkerElement
  // Ahora manejaremos múltiples marcadores
  markers: any[] = []; // Array para almacenar múltiples marcadores
  polygon: google.maps.Polygon | null = null; // El polígono del cultivo

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    // Se asegura de que el mapa esté inicializado antes de intentar dibujar
    if (this.map && this.map.googleMap) {
      if (changes['cultivationPolygonCoords']) {
        // Si las coordenadas del polígono del cultivo cambian, redibujar el polígono
        this.drawCultivationPolygon();
        // Centrar el mapa en el polígono si hay coordenadas
        if (this.cultivationPolygonCoords && this.cultivationPolygonCoords.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          this.cultivationPolygonCoords.forEach(coord => bounds.extend(coord));
          this.map.googleMap.fitBounds(bounds);
          // Ajustar el zoom si es demasiado cercano después de fitBounds, para no ver solo una porción del polígono
          if (this.map.googleMap.getZoom() && this.map.googleMap.getZoom()! > 16) {
            this.map.googleMap.setZoom(16);
          }
        } else {
          // Si no hay coordenadas de polígono, limpiar el polígono existente
          if (this.polygon) {
            this.polygon.setMap(null);
            this.polygon = null;
          }
        }
      }
      if (changes['sensorMarkerCoords'] && this.sensorMarkerCoords) {
        // Si se proporcionan coordenadas de un sensor existente, colocar el marcador
        this.addSingleSensorMarker(this.sensorMarkerCoords.lat, this.sensorMarkerCoords.lng);
      }
    }
  }

  ngAfterViewInit() {
    // Usar setTimeout para asegurar que el mapa esté completamente renderizado
    setTimeout(() => {
      if (this.map && this.map.googleMap) {
        const mapInstance = this.map.googleMap!;

        mapInstance.setOptions({
          draggableCursor: 'grab',
        });

        // Listener para el clic en el mapa para colocar el marcador del sensor
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          // Solo permitir colocar marcador si enableMapClickPlacement es true
          if (this.enableMapClickPlacement && event.latLng) {
            this.addSingleSensorMarker(event.latLng.lat(), event.latLng.lng());
          }
        });

        // Dibujar el polígono inicial y el marcador del sensor si ya hay datos al inicio
        this.drawCultivationPolygon();
        if (this.sensorMarkerCoords) {
          this.addSingleSensorMarker(this.sensorMarkerCoords.lat, this.sensorMarkerCoords.lng);
        }
      } else {
        console.error('GoogleMap instance not available in ngAfterViewInit.');
      }
    });
  }

  /**
   * Dibuja el polígono del área de cultivo.
   */
  drawCultivationPolygon() {
    if (!this.map || !this.map.googleMap) {
      console.warn('Map not initialized, cannot draw polygon.');
      return;
    }

    if (this.polygon) {
      this.polygon.setMap(null); // Limpiar polígono anterior
    }

    if (this.cultivationPolygonCoords && this.cultivationPolygonCoords.length > 0) {
      this.polygon = new google.maps.Polygon({
        paths: this.cultivationPolygonCoords,
        strokeColor: '#0e6f1c', // Color verde para el polígono del cultivo
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0e6f1c',
        fillOpacity: 0.25,
        map: this.map.googleMap!
      });
    }
  }

  /**
   * Crea y añade un único marcador para el sensor en el mapa.
   * Si enableMapClickPlacement es true, este marcador será el único y arrastrable.
   * Si enableMapClickPlacement es false, se añade a la lista de marcadores y no es arrastrable.
   * @param lat Latitud del punto.
   * @param lng Longitud del punto.
   */
  addSingleSensorMarker(lat: number, lng: number): void {
    if (!this.map || !this.map.googleMap) {
      console.error('Map not initialized, cannot set marker.');
      return;
    }
    const mapInstance = this.map.googleMap!;

    // Si estamos en modo de colocación de un solo marcador (RegistroSensorComponent)
    if (this.enableMapClickPlacement) {
      // Limpiamos el marcador anterior si existe
      if (this.markers.length > 0) {
        this.markers[0].map = null;
        this.markers = [];
      }
    }

    // Crear un elemento HTML para el contenido del marcador (un círculo azul con un icono)
    const markerContent = document.createElement('div');
    markerContent.className = 'sensor-marker-content'; // Clase para estilos CSS
    markerContent.innerHTML = `
      <div class="marker-circle"></div>
      <mat-icon class="marker-icon">sensors</mat-icon>
    `;

    let newMarker: any;

    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      newMarker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: mapInstance,
        content: markerContent,
        gmpDraggable: this.enableMapClickPlacement, // Solo arrastrable si enableMapClickPlacement es true
      });

      if (this.enableMapClickPlacement) {
        newMarker.addListener('gmp-dragend', () => {
          this.updateSensorCoordinates(newMarker);
        });
      }
    } else {
      console.warn('AdvancedMarkerElement no está disponible. Usando google.maps.Marker como fallback.');
      newMarker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: this.enableMapClickPlacement, // Solo arrastrable si enableMapClickPlacement es true
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      });
      if (this.enableMapClickPlacement) {
        newMarker.addListener('dragend', () => {
          this.updateSensorCoordinates(newMarker);
        });
      }
    }

    this.markers.push(newMarker);

    // Si estamos en modo de colocación de un solo marcador, actualizamos las coordenadas y centramos
    if (this.enableMapClickPlacement) {
      mapInstance.setCenter({ lat, lng });
      this.updateSensorCoordinates(newMarker);
    }
  }

  /**
   * Actualiza las coordenadas del sensor y emite el evento de cambio.
   * Incluye la validación de si el punto está dentro del polígono del cultivo.
   * @param marker El marcador cuya posición se va a actualizar.
   */
  updateSensorCoordinates(marker: any) {
    if (!marker || !marker.position) {
      this.geo = null;
      this.onGeolocalizacionChange.emit({ Latitud: '', Longitud: '', isValid: false });
      return;
    }

    const position = marker.position;
    const latLng = new google.maps.LatLng(position.lat, position.lng);
    let isValidLocation = true;

    // Verificar si el punto está dentro del polígono del cultivo
    if (this.polygon && this.polygon.getPaths().getLength() > 0) {
      isValidLocation = google.maps.geometry.poly.containsLocation(latLng, this.polygon);
    }

    const geolocalizacion: SingleGeoPoint = {
      Latitud: position.lat.toFixed(6),
      Longitud: position.lng.toFixed(6),
      isValid: isValidLocation
    };

    this.geo = geolocalizacion;
    this.onGeolocalizacionChange.emit(geolocalizacion);
  }

  /**
   * Elimina todos los marcadores del mapa.
   */
  clearAllMarkers() {
    this.markers.forEach(marker => {
      marker.map = null;
    });
    this.markers = [];
    this.geo = null;
    this.onGeolocalizacionChange.emit({ Latitud: '', Longitud: '', isValid: false });
  }

  /**
   * Muestra múltiples marcadores de sensor en el mapa.
   * @param sensorCoords Array de objetos LatLngLiteral con las coordenadas de los sensores.
   */
  displaySensorMarkers(sensorCoords: google.maps.LatLngLiteral[]): void {
    this.clearAllMarkers(); // Limpiar marcadores existentes antes de añadir nuevos

    if (!this.map || !this.map.googleMap) {
      console.error('Map not initialized, cannot display markers.');
      return;
    }
    const mapInstance = this.map.googleMap!;

    const bounds = new google.maps.LatLngBounds();
    sensorCoords.forEach(coord => {
      this.addSingleSensorMarker(coord.lat, coord.lng); // Reutilizar addSingleSensorMarker
      bounds.extend(coord);
    });

    if (sensorCoords.length > 0) {
      mapInstance.fitBounds(bounds);
      // Ajustar el zoom si es demasiado cercano después de fitBounds
      if (mapInstance.getZoom() && mapInstance.getZoom()! > 16) {
        mapInstance.setZoom(16);
      }
    }
  }

  /**
   * Función para reiniciar el mapa, borrando el marcador del sensor y el polígono del cultivo.
   */
  resetMap() {
    this.clearAllMarkers(); // Limpiar todos los marcadores
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
    this.geo = null; // Limpiar las coordenadas mostradas
    this.onGeolocalizacionChange.emit({ Latitud: '', Longitud: '', isValid: false }); // Emitir coordenadas vacías
    // Opcional: Volver al centro y zoom iniciales
    if (this.map && this.map.googleMap) {
      this.map.googleMap.setCenter(this.center);
      this.map.googleMap.setZoom(this.zoom);
    }
  }
}
