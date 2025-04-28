import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { API_URLS } from '../../../config/api_config'; // Asegúrate de que la ruta sea correcta
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

interface SensorData {
  id: number;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  cultivo: string;
  fechaRegistro: string;
}

@Component({
  selector: 'app-gestion-sensores', // Selector actualizado
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule
  ],
  templateUrl: './gestion-sensores.component.html',
  styleUrls: ['./gestion-sensores.component.css']
})
export class GestionSensoresComponent implements OnInit {
  constructor(private http: HttpClient) { }

  displayedColumns: string[] = ['id', 'nombre', 'ubicacion', 'latitud', 'longitud', 'cultivo', 'fechaRegistro'];
  dataSource: SensorData[] = [];
  filtros = {
    id: '',
    nombre: '',
    ubicacion: '',
    cultivo: ''
  }
  dataFilter: SensorData[] = [];

  ngOnInit(): void {
    this.consultarDatos();
  }

  aplicarFiltros() {
    this.dataFilter = this.dataSource.filter((row: SensorData) => {
      return Object.entries(this.filtros).every(([key, filtro]) => {
        const valorFiltro = filtro.toLowerCase();
        const rowValue = row[key as keyof SensorData];
        return rowValue?.toString().toLowerCase().includes(valorFiltro);
      });
    });
  }

  consultarDatos(): void {
    this.http.get<SensorData[]>(API_URLS.MID.API_MID_SPIKE)
      .subscribe(
        (data) => {
          console.log('Datos de sensores:', data);
          this.dataSource = data;
          this.dataFilter = [...this.dataSource];
        },
        (error) => {
          console.error('Error al obtener datos de sensores:', error);
        }
      );
  }
}
