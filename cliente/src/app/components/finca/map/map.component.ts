import { Component,  EventEmitter, Output, ViewChild, AfterViewInit  } from '@angular/core';
import { GoogleMap, GoogleMapsModule  } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  imports: [
    GoogleMapsModule,
    CommonModule
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})

export class MapComponent implements AfterViewInit {

  
  @ViewChild('map', { static: false }) map!: GoogleMap;
  @Output() onGeolocalizacionChange = new EventEmitter<any>();

  center = { lat: 4.570868, lng: -74.297333 };
  zoom = 12;
  geo: any = null;

  markers: google.maps.Marker[] = [];
  polygon: google.maps.Polygon | null = null;

  ngAfterViewInit() {
    const mapInstance = this.map.googleMap!;

    mapInstance.setOptions({
      draggableCursor: 'grab',
    });

    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (this.markers.length >= 4) return;

      const marker = new google.maps.Marker({
        position: event.latLng!,
        map: mapInstance,
        draggable: true,
      });

      this.markers.push(marker);

      marker.addListener('dragend', () => {
        this.updatePolygon();
      });

      if (this.markers.length === 4) {
        this.drawPolygon();
      }
    });
  }

  drawPolygon() {
    if (this.polygon) {
      this.polygon.setMap(null);
    }

    const path = this.markers.map(marker => marker.getPosition()!);

    this.polygon = new google.maps.Polygon({
      paths: path,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: this.map.googleMap!
    });

    this.updatePolygon();
  }

  updatePolygon() {
    if (!this.polygon) return;

    const path = this.markers.map(marker => marker.getPosition()!);
    this.polygon.setPath(path);

    // Emitir los datos (Latitud y Longitud Inicial/Final)
    const latitudes = path.map(p => p.lat());
    const longitudes = path.map(p => p.lng());

    const geolocalizacion = {
      LatitudInicial: Math.min(...latitudes).toString(),
      LatitudFinal: Math.max(...latitudes).toString(),
      LongitudInicial: Math.min(...longitudes).toString(),
      LongitudFinal: Math.max(...longitudes).toString()
    };

    this.geo = geolocalizacion;
    this.onGeolocalizacionChange.emit(geolocalizacion);

  }

  // Opcional: función para reiniciar los puntos
  resetMap() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    if (this.polygon) {
      this.polygon.setMap(null);
      this.polygon = null;
    }
  }
}