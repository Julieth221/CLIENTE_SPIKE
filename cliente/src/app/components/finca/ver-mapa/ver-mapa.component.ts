import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ver-mapa',
  imports: [
    GoogleMapsModule,
    CommonModule
  ],
  templateUrl: './ver-mapa.component.html',
  styleUrl: './ver-mapa.component.css'
})
export class VerMapaComponent implements AfterViewInit, OnChanges {
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
  
  // Configuración del mapa
  center: google.maps.LatLngLiteral = { lat: 4.570868, lng: -74.297333 };
  zoom = 14;
  
  // Elementos del mapa
  marcadores: google.maps.Marker[] = [];
  poligono: google.maps.Polygon | null = null;
  private ultimasCoordenadas: any = null;
  
  ngAfterViewInit() {
    this.inicializarMapa();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['coordenadas'] && !changes['coordenadas'].firstChange) {
      const nuevasCoordenadas = changes['coordenadas'].currentValue;
      
      // Verificar si las coordenadas realmente cambiaron
      if (!this.sonCoordenadasIguales(this.ultimasCoordenadas, nuevasCoordenadas)) {
        this.ultimasCoordenadas = { ...nuevasCoordenadas };
        this.limpiarMapa();
        this.inicializarMapa();
      }
    }
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
  
  inicializarMapa() {
    if (!this.mapa || !this.mapa.googleMap) {
      return;
    }
    
    // Calcular el centro del mapa basado en las coordenadas
    this.center = this.calcularCentro();
    this.mapa.googleMap.setCenter(this.center);
    
    // Crear los marcadores en los vértices
    const vertices = this.calcularVertices();
    
    // Crear marcadores para cada vértice
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
      
      // Añadir tooltip al marcador si hay información de parcela
      if (this.mostrarDetalles && (this.nombreParcela || this.tamanoParcela)) {
        const infoWindow = new google.maps.InfoWindow({
          content: this.crearContenidoTooltip()
        });
        
        marcador.addListener('mouseover', () => {
          infoWindow.open(this.mapa.googleMap, marcador);
        });
        
        marcador.addListener('mouseout', () => {
          infoWindow.close();
        });
      }
    });
    
    // Dibujar el polígono
    this.dibujarPoligono(vertices);
  }
  
  calcularVertices(): google.maps.LatLngLiteral[] {
    const { latitudInicial, longitudInicial, latitudFinal, longitudFinal } = this.coordenadas;
    
    return [
      { lat: latitudInicial, lng: longitudInicial }, // Esquina noroeste
      { lat: latitudInicial, lng: longitudFinal },  // Esquina noreste
      { lat: latitudFinal, lng: longitudFinal },   // Esquina sureste
      { lat: latitudFinal, lng: longitudInicial }  // Esquina suroeste
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
    if (!this.mapa || !this.mapa.googleMap || vertices.length < 3) return;
    
    this.poligono = new google.maps.Polygon({
      paths: vertices,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: this.mapa.googleMap
    });
    
    // Añadir tooltip al polígono
    if (this.mostrarDetalles && (this.nombreParcela || this.tamanoParcela)) {
      const infoWindow = new google.maps.InfoWindow({
        content: this.crearContenidoTooltip()
      });
      
      this.poligono.addListener('mouseover', (event: any) => {
        infoWindow.setPosition(event.latLng);
        infoWindow.open(this.mapa.googleMap);
      });
      
      this.poligono.addListener('mouseout', () => {
        infoWindow.close();
      });
    }
  }
  
  crearContenidoTooltip(): string {
    let contenido = '<div style="padding: 5px;">';
    
    if (this.nombreParcela) {
      contenido += `<strong>${this.nombreParcela}</strong><br>`;
    }
    
    if (this.tamanoParcela) {
      contenido += `Tamaño: ${this.tamanoParcela.toFixed(2)} ha`;
    }
    
    contenido += '</div>';
    return contenido;
  }
  
  limpiarMapa() {
    // Eliminar marcadores
    this.marcadores.forEach(marcador => {
      marcador.setMap(null);
    });
    this.marcadores = [];
    
    // Eliminar polígono
    if (this.poligono) {
      this.poligono.setMap(null);
      this.poligono = null;
    }
  }
}
