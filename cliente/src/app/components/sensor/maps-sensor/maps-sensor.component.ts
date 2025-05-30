import { Component, EventEmitter, Output, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

interface SingleGeoPoint {
  Latitud: string;
  Longitud: string;
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

  @ViewChild('map', { static: false }) map!: GoogleMap;
  @Output() onGeolocalizacionChange = new EventEmitter<SingleGeoPoint>();

  @Input() cultivationPolygonCoords: google.maps.LatLngLiteral[] | null = null;
  @Input() sensorMarkerCoords: google.maps.LatLngLiteral | null = null;

  center = { lat: 4.570868, lng: -74.297333 }; // Centro predeterminado
  zoom = 12;
  geo: SingleGeoPoint | null = null; // Coordenadas del marcador del sensor

  // Usamos 'any' para el marcador para ser compatible con AdvancedMarkerElement
  // ya que su tipo exacto puede variar dependiendo de cómo se cargue la librería.
  marker: any | null = null;
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
        }
      }
      if (changes['sensorMarkerCoords'] && this.sensorMarkerCoords) {
        // Si se proporcionan coordenadas de un sensor existente, colocar el marcador
        this.setSensorMarker(this.sensorMarkerCoords.lat, this.sensorMarkerCoords.lng);
      }
    }
  }

  ngAfterViewInit() {
    const mapInstance = this.map.googleMap!;

    mapInstance.setOptions({
      draggableCursor: 'grab',
    });

    // Listener para el clic en el mapa para colocar el marcador del sensor
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      // Solo permitir colocar marcador si hay un polígono de cultivo visible
      if (this.cultivationPolygonCoords && this.cultivationPolygonCoords.length > 0) {
        this.setSensorMarker(event.latLng!.lat(), event.latLng!.lng());
      }
    });

    // Dibujar el polígono inicial y el marcador del sensor si ya hay datos al inicio
    this.drawCultivationPolygon();
    if (this.sensorMarkerCoords) {
      this.setSensorMarker(this.sensorMarkerCoords.lat, this.sensorMarkerCoords.lng);
    }
  }

  /**
   * Dibuja el polígono del área de cultivo.
   */
  drawCultivationPolygon() {
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
   * Establece un marcador para el sensor en el mapa y actualiza las coordenadas.
   * Utiliza google.maps.marker.AdvancedMarkerElement.
   * @param lat Latitud del punto.
   * @param lng Longitud del punto.
   */
  setSensorMarker(lat: number, lng: number): void {
    const mapInstance = this.map.googleMap!;

    // Si ya hay un marcador, lo removemos antes de añadir el nuevo
    if (this.marker) {
      this.marker.map = null; // Para AdvancedMarkerElement, se asigna null a la propiedad map
    }

    // Crear un elemento HTML para el contenido del marcador (un círculo azul con un icono)
    const markerContent = document.createElement('div');
    markerContent.className = 'sensor-marker-content'; // Clase para estilos CSS
    markerContent.innerHTML = `
      <div class="marker-circle"></div>
      <mat-icon class="marker-icon">sensors</mat-icon>
    `;

    // Crear un nuevo marcador en la posición dada usando AdvancedMarkerElement
    // Es importante asegurarse de que google.maps.marker esté disponible (cargando la librería 'marker')
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      this.marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: mapInstance,
        content: markerContent, // Usar el elemento HTML personalizado
        gmpDraggable: true, // Propiedad para hacer el marcador arrastrable en AdvancedMarkerElement
      });

      // Escuchar el evento de arrastre del marcador para actualizar las coordenadas
      this.marker.addListener('gmp-dragend', () => {
        this.updateSensorCoordinates();
      });
    } else {
      // Fallback a google.maps.Marker si AdvancedMarkerElement no está disponible
      // Esto debería generar la advertencia de deprecación, pero asegura la funcionalidad
      console.warn('AdvancedMarkerElement no está disponible. Usando google.maps.Marker como fallback. Considera cargar la librería "marker" y la versión "beta" de la API.');
      this.marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: true,
        icon: { // Icono personalizado para el sensor (un círculo azul)
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#4285F4', // Azul para el marcador del sensor
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF'
        }
      });
      this.marker.addListener('dragend', () => {
        this.updateSensorCoordinates();
      });
    }

    // Actualizar las coordenadas inmediatamente después de colocar el marcador
    this.updateSensorCoordinates();
  }

  updateSensorCoordinates() {
    if (!this.marker || !this.marker.position) { // Para AdvancedMarkerElement, la posición está directamente en .position
      this.geo = null;
      this.onGeolocalizacionChange.emit({ Latitud: '', Longitud: '' }); // Emitir vacío si no hay marcador
      return;
    }

    const position = this.marker.position;
    const geolocalizacion: SingleGeoPoint = {
      Latitud: position.lat.toFixed(6), // Acceder a lat y lng directamente
      Longitud: position.lng.toFixed(6) // Acceder a lat y lng directamente
    };

    this.geo = geolocalizacion;
    this.onGeolocalizacionChange.emit(geolocalizacion);
  }

  /**
   * Función para reiniciar el mapa, borrando el marcador del sensor y el polígono del cultivo.
   */
  resetMap() {
    if (this.marker) {
      this.marker.map = null; // Para AdvancedMarkerElement, se asigna null a la propiedad map
      this.marker = null;
    }
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
}
