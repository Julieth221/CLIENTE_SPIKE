import { Component, EventEmitter, Output, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Import MatIconModule for custom marker content

interface SingleGeoPoint {
  Latitud: string;
  Longitud: string;
}

@Component({
  selector: 'app-maps-sensor',
  standalone: true,
  imports: [
    GoogleMapsModule,
    CommonModule,
    MatIconModule // Add MatIconModule here
  ],
  templateUrl: './maps-sensor.component.html',
  styleUrl: './maps-sensor.component.css'
})
export class MapsSensorComponent implements AfterViewInit, OnChanges {

  @ViewChild('map', { static: false }) map!: GoogleMap;
  @Output() onGeolocalizacionChange = new EventEmitter<SingleGeoPoint>();

  @Input() cultivationPolygonCoords: google.maps.LatLngLiteral[] | null = null;
  @Input() sensorMarkers: google.maps.LatLngLiteral[] | null = null; // Ahora acepta un array de marcadores
  @Input() enableMapClickPlacement: boolean = true; // Nuevo input para controlar si se puede hacer clic para colocar marcador

  center = { lat: 4.570868, lng: -74.297333 }; // Centro predeterminado
  zoom = 12;
  geo: SingleGeoPoint | null = null; // Coordenadas del último marcador colocado/arrastrado

  activeMarkers: any[] = []; // Array para almacenar los AdvancedMarkerElement
  polygon: google.maps.Polygon | null = null; // El polígono del cultivo

  constructor() {
    console.log('MapsSensorComponent constructor called.');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('MapsSensorComponent ngOnChanges:', changes);
    // Se asegura de que el mapa esté inicializado antes de intentar dibujar
    if (this.map && this.map.googleMap) {
      if (changes['cultivationPolygonCoords']) {
        this.drawCultivationPolygon();
        if (this.cultivationPolygonCoords && this.cultivationPolygonCoords.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          this.cultivationPolygonCoords.forEach(coord => bounds.extend(coord));
          this.map.googleMap.fitBounds(bounds);
          if (this.map.googleMap.getZoom() && this.map.googleMap.getZoom()! > 16) {
            this.map.googleMap.setZoom(16);
          }
        } else {
          // Si no hay polígono, resetear el mapa a la vista general
          this.map.googleMap.setCenter(this.center);
          this.map.googleMap.setZoom(this.zoom);
        }
      }
      if (changes['sensorMarkers'] && this.sensorMarkers) {
        this.displaySensorMarkers(this.sensorMarkers);
      } else if (changes['sensorMarkers'] && !this.sensorMarkers) {
        // Si sensorMarkers se vuelve null, limpiar los marcadores
        this.clearAllMarkers();
      }
    } else {
      console.warn('MapsSensorComponent: map or googleMap not yet available in ngOnChanges.');
    }
  }

  ngAfterViewInit() {
    console.log('MapsSensorComponent ngAfterViewInit called. Map instance:', this.map);
    if (!this.map || !this.map.googleMap) {
      console.error('MapsSensorComponent: Google Map instance is not available after view init.');
      return;
    }

    const mapInstance = this.map.googleMap!;

    mapInstance.setOptions({
      draggableCursor: 'grab',
    });

    // Listener para el clic en el mapa para colocar el marcador del sensor
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      console.log('Map clicked. enableMapClickPlacement:', this.enableMapClickPlacement, 'Event:', event);
      // Solo permitir colocar marcador si enableMapClickPlacement es true
      if (this.enableMapClickPlacement) {
        this.addSingleSensorMarker(event.latLng!.lat(), event.latLng!.lng());
      } else {
        console.log('Map click ignored: enableMapClickPlacement is false.');
      }
    });

    // Dibujar el polígono inicial y los marcadores si ya hay datos al inicio
    this.drawCultivationPolygon();
    if (this.sensorMarkers && this.sensorMarkers.length > 0) {
      this.displaySensorMarkers(this.sensorMarkers);
    }
  }

  /**
   * Dibuja el polígono del área de cultivo.
   */
  drawCultivationPolygon() {
    console.log('Drawing cultivation polygon. Coords:', this.cultivationPolygonCoords);
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
   * Añade un único marcador de sensor al mapa (usado para la funcionalidad de registro).
   * Solo permite un marcador a la vez.
   * @param lat Latitud del punto.
   * @param lng Longitud del punto.
   */
  addSingleSensorMarker(lat: number, lng: number): void {
    console.log('Attempting to add single sensor marker at:', { lat, lng });
    const mapInstance = this.map.googleMap!;
    this.clearAllMarkers(); // Asegurarse de que solo haya un marcador

    // Crear un elemento HTML para el contenido del marcador
    const markerContent = document.createElement('div');
    markerContent.className = 'sensor-marker-content';
    markerContent.innerHTML = `
      <div class="marker-circle"></div>
      <mat-icon class="marker-icon">sensors</mat-icon>
    `;

    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      const newMarker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: mapInstance,
        content: markerContent,
        gmpDraggable: true,
      });

      newMarker.addListener('gmp-dragend', () => {
        console.log('Marker dragged. New position:', newMarker.position);
        this.updateSensorCoordinates(newMarker);
      });
      this.activeMarkers.push(newMarker);
      console.log('AdvancedMarkerElement added.');
    } else {
      console.warn('AdvancedMarkerElement no está disponible. Usando google.maps.Marker como fallback. Asegúrate de cargar &v=beta&libraries=marker.');
      const newMarker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: true,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      });
      newMarker.addListener('dragend', () => {
        console.log('Fallback Marker dragged. New position:', newMarker.getPosition());
        this.updateSensorCoordinates(newMarker);
      });
      this.activeMarkers.push(newMarker);
      console.log('Fallback Marker added.');
    }

    this.updateSensorCoordinates(this.activeMarkers[0]); // Actualizar coordenadas del único marcador
  }


  /**
   * Muestra múltiples marcadores de sensor en el mapa (usado para la funcionalidad de localización/visualización).
   * @param markers Array de LatLngLiteral con las posiciones de los sensores.
   */
  displaySensorMarkers(markers: google.maps.LatLngLiteral[]): void {
    console.log('Displaying multiple sensor markers:', markers);
    const mapInstance = this.map.googleMap!;
    this.clearAllMarkers(); // Limpiar marcadores existentes antes de añadir nuevos

    if (!markers || markers.length === 0) {
      return;
    }

    markers.forEach(pos => {
      const markerContent = document.createElement('div');
      markerContent.className = 'sensor-marker-content';
      markerContent.innerHTML = `
        <div class="marker-circle"></div>
        <mat-icon class="marker-icon">sensors</mat-icon>
      `;

      if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
        const newMarker = new google.maps.marker.AdvancedMarkerElement({
          position: pos,
          map: mapInstance,
          content: markerContent,
          gmpDraggable: false, // Los marcadores de visualización no son arrastrables
        });
        this.activeMarkers.push(newMarker);
      } else {
        const newMarker = new google.maps.Marker({
          position: pos,
          map: mapInstance,
          draggable: false,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
          }
        });
        this.activeMarkers.push(newMarker);
      }
    });

    // Centrar el mapa para que muestre todos los marcadores si hay varios
    if (markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach(marker => bounds.extend(marker));
      mapInstance.fitBounds(bounds);
      // Ajustar el zoom si es demasiado cercano después de fitBounds
      if (mapInstance.getZoom() && mapInstance.getZoom()! > 16) {
        mapInstance.setZoom(16);
      }
    }
  }

  updateSensorCoordinates(marker: any) {
    console.log('Updating sensor coordinates. Marker:', marker);
    if (!marker || !marker.position) {
      this.geo = null;
      this.onGeolocalizacionChange.emit({ Latitud: '', Longitud: '' });
      console.log('No marker position, emitting empty.');
      return;
    }

    const position = marker.position;
    // AdvancedMarkerElement's position is an object with lat/lng properties
    // For google.maps.Marker, position is a LatLng object with lat() and lng() methods
    const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
    const lng = typeof position.lng === 'function' ? position.lng() : position.lng;

    const geolocalizacion: SingleGeoPoint = {
      Latitud: lat.toFixed(6),
      Longitud: lng.toFixed(6)
    };

    // Perform point-in-polygon check and emit 'INVALID' if outside
    if (this.polygon && !this.isPointInPolygon(new google.maps.LatLng(lat, lng), this.polygon)) {
      console.warn('El punto seleccionado está fuera del polígono del cultivo. Emitting with _INVALID suffix.');
      // Emit the actual coordinates, but also signal invalidity
      this.onGeolocalizacionChange.emit({ Latitud: geolocalizacion.Latitud, Longitud: geolocalizacion.Longitud + '_INVALID' });
    } else {
      console.log('Point is inside polygon or no polygon. Emitting valid coordinates.');
      this.onGeolocalizacionChange.emit(geolocalizacion);
    }

    this.geo = geolocalizacion; // Always update geo for display
    console.log('Updated this.geo:', this.geo);
  }

  /**
   * Limpia todos los marcadores activos del mapa.
   */
  clearAllMarkers(): void {
    console.log('Clearing all markers.');
    this.activeMarkers.forEach(marker => {
      if (marker.map) { // AdvancedMarkerElement uses .map = null to remove
        marker.map = null;
      } else if (marker.setMap) { // Fallback for google.maps.Marker
        marker.setMap(null);
      }
    });
    this.activeMarkers = [];
  }

  /**
   * Función para reiniciar el mapa, borrando todos los marcadores y el polígono del cultivo.
   */
  resetMap() {
    console.log('Resetting map.');
    this.clearAllMarkers();
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
    this.geo = null; // Limpiar las coordenadas mostradas
    this.onGeolocalizacionChange.emit({ Latitud: '', Longitud: '' }); // Emitir coordenadas vacías
    // Opcional: Volver al centro y zoom iniciales
    this.map.googleMap!.setCenter(this.center);
    this.map.googleMap!.setZoom(this.zoom);
  }

  /**
   * Verifica si un punto (LatLng) está dentro de un polígono (google.maps.Polygon).
   * Requiere la librería 'geometry' de Google Maps API.
   * @param point El punto a verificar.
   * @param polygon El polígono.
   * @returns True si el punto está dentro del polígono, false en caso contrario.
   */
  isPointInPolygon(point: google.maps.LatLng, polygon: google.maps.Polygon): boolean {
    if (google.maps.geometry && google.maps.geometry.poly) {
      return google.maps.geometry.poly.containsLocation(point, polygon);
    }
    console.warn("La librería 'geometry' de Google Maps API no está cargada. La validación de polígono no funcionará. Asegúrate de cargar &libraries=geometry.");
    return true; // Asumir verdadero si la librería no está disponible para no bloquear
  }
}
