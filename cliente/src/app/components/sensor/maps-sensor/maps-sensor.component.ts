import { Component, EventEmitter, Output, ViewChild, AfterViewInit } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maps-sensor',
  imports: [
    GoogleMapsModule,
    CommonModule
  ],
  
  templateUrl: './maps-sensor.component.html',
  styleUrls: ['./maps-sensor.component.css']
})

export class MapComponent implements AfterViewInit {
  @ViewChild('map', { static: false }) map!: GoogleMap;
  @Output() onLocationChange = new EventEmitter<{ lat: number, lng: number }>();

  center = { lat: 4.570868, lng: -74.297333 };
  zoom = 12;
  marker: google.maps.Marker | null = null;

  ngAfterViewInit() {
    const mapInstance = this.map.googleMap!;

    mapInstance.setOptions({
      draggableCursor: 'grab',
    });

    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (this.marker) {
        this.marker.setMap(null);
      }

      this.marker = new google.maps.Marker({
        position: event.latLng!,
        map: mapInstance,
        draggable: false,
      });

      this.onLocationChange.emit({
        lat: event.latLng!.lat(),
        lng: event.latLng!.lng()
      });
    });
  }

  // Opcional: función para reiniciar el marcador
  resetMap() {
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
  }
}
