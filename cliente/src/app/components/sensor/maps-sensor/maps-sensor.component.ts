import { Component, EventEmitter, Output, ViewChild, AfterViewInit, Input } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

interface SingleGeoPoint {
  Latitud: string;
  Longitud: string;
}

@Component({
  selector: 'app-maps-sensor', // Selector actualizado
  standalone: true,
  imports: [
    GoogleMapsModule,
    CommonModule
  ],
  templateUrl: './maps-sensor.component.html', // Nombre de plantilla actualizado
  styleUrl: './maps-sensor.component.css' // Nombre de estilo actualizado
})
export class MapsSensorComponent implements AfterViewInit { // Nombre de clase actualizado

  @ViewChild('map', { static: false }) map!: GoogleMap;
  @Output() onGeolocalizacionChange = new EventEmitter<SingleGeoPoint>(); // Para emitir si se hace clic en el mapa

  center = { lat: 4.570868, lng: -74.297333 }; // Centro predeterminado (ej. Colombia)
  zoom = 12;
  geo: SingleGeoPoint | null = null; // Coordenadas del marcador actual
  marker: google.maps.Marker | null = null; // El único marcador en el mapa

  constructor() { }

  ngAfterViewInit() {
    const mapInstance = this.map.googleMap!;

    mapInstance.setOptions({
      draggableCursor: 'grab',
    });

    // Deshabilitar el clic en el mapa para añadir marcadores si no es el propósito principal
    // Si quieres que el usuario pueda hacer clic para añadir un marcador, puedes dejarlo.
    // Para esta vista, el marcador se añade vía el botón "Ver mapa".
    // mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
    //   this.setMarker(event.latLng!.lat(), event.latLng!.lng());
    // });
  }

  /**
   * Establece un marcador en el mapa y actualiza las coordenadas.
   * @param lat Latitud del punto.
   * @param lng Longitud del punto.
   */
  setMarker(lat: number, lng: number): void {
    const mapInstance = this.map.googleMap!;

    // Si ya hay un marcador, lo removemos antes de añadir el nuevo
    if (this.marker) {
      this.marker.setMap(null);
    }

    // Crear un nuevo marcador en la posición dada
    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      draggable: true, // Permitir arrastrar el marcador
    });

    // Escuchar el evento de arrastre del marcador para actualizar las coordenadas
    this.marker.addListener('dragend', () => {
      this.updateCoordinates();
    });

    // Actualizar las coordenadas inmediatamente después de colocar el marcador
    this.updateCoordinates();

    // Centrar el mapa en el nuevo marcador
    mapInstance.setCenter({ lat, lng });
    mapInstance.setZoom(15); // Zoom más cercano al colocar un marcador
  }

  updateCoordinates() {
    if (!this.marker || !this.marker.getPosition()) {
      this.geo = null;
      this.onGeolocalizacionChange.emit({ Latitud: '', Longitud: '' }); // Emitir vacío si no hay marcador
      return;
    }

    const position = this.marker.getPosition()!;
    const geolocalizacion: SingleGeoPoint = {
      Latitud: position.lat().toFixed(6), // Redondear a 6 decimales para precisión
      Longitud: position.lng().toFixed(6) // Redondear a 6 decimales para precisión
    };

    this.geo = geolocalizacion;
    this.onGeolocalizacionChange.emit(geolocalizacion);
  }

  // Función para reiniciar el mapa y borrar el punto
  resetMap() {
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
    this.geo = null; // Limpiar las coordenadas mostradas
    this.onGeolocalizacionChange.emit({ Latitud: '', Longitud: '' }); // Emitir coordenadas vacías
    // Opcional: Volver al centro y zoom iniciales
    this.map.googleMap!.setCenter(this.center);
    this.map.googleMap!.setZoom(this.zoom);
  }
}
