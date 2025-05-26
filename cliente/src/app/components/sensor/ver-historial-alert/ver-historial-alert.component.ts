import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

// Interfaz para la alerta (referencia)
interface Alerta {
  Id: number;
  Nombre: string;
  TipoSensor: string;
  Cultivo: string;
  // ... otras propiedades de la alerta si son necesarias para mostrar
}

// Interfaz para el historial de alertas (basada en tu modelo Go)
interface AlertasHistorial {
  Id: number;
  IdAlerta: Alerta;
  FechaAlerta: string;
  Estado: boolean; // true: resuelta, false: pendiente/activa
  Descripcion: string;
}

@Component({
  selector: 'app-ver-historial-alert',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
  ],
  providers: [DatePipe],
  templateUrl: './ver-historial-alert.component.html',
  styleUrl: './ver-historial-alert.component.css'
})
export class VerHistorialAlertComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<VerHistorialAlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertasHistorial // Recibe los datos de la alerta histórica
  ) { }

  ngOnInit(): void {
    console.log('Datos de la alerta histórica en el diálogo:', this.data);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  // Helper para obtener el color del estado
  getStatusColor(estado: boolean): string {
    return estado ? '#4CAF50' : '#FFC107'; // Verde para resuelta, Amarillo para pendiente
  }

  getStatusText(estado: boolean): string {
    return estado ? 'Resuelta' : 'Pendiente';
  }
}
