import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="info-modal-container">
      <div class="info-modal-header">
        <mat-icon class="info-icon">info</mat-icon>
        <h2>Información Importante</h2>
      </div>

      <div class="info-modal-content">
        <p class="info-description">
          En esta sección podrá visualizar el historial completo de versiones y arrendamientos de sus parcelas. 
          Esta información es crucial para mantener un registro detallado de los cambios y la trazabilidad de sus propiedades.
        </p>
        
        <div class="info-features">
          <h4>Características principales:</h4>
          <ul>
            <li>Visualización cronológica de todas las versiones de cada parcela</li>
            <li>Registro detallado de arrendamientos y sus cambios</li>
            <li>Información sobre arrendatarios y períodos de arrendamiento</li>
            <li>Exportación de datos en formatos Excel y PDF</li>
          </ul>
        </div>

        <div class="info-tips">
          <h4>Consejos de uso:</h4>
          <ul>
            <li>Utilice los filtros para encontrar información específica</li>
            <li>Exporte los datos para mantener un respaldo de la información</li>
            <li>Revise regularmente el historial para mantener un control actualizado</li>
          </ul>
        </div>
      </div>

      <div class="info-modal-footer">
        <mat-checkbox [(ngModel)]="noMostrarMas">
          No volver a mostrar este mensaje
        </mat-checkbox>
        <button mat-raised-button color="primary" (click)="cerrar()">
          Entendido
        </button>
      </div>
    </div>
  `,
  styles: [`
    .info-modal-container {
      padding: 24px;
      max-width: 600px;
    }

    .info-modal-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .info-icon {
      color: #1976d2;
      margin-right: 12px;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    h2 {
      margin: 0;
      color: #1976d2;
      font-size: 20px;
    }

    .info-description {
      color: #495057;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .info-features, .info-tips {
      background: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }

    h4 {
      color: #1976d2;
      margin: 0 0 12px 0;
    }

    ul {
      margin: 0;
      padding-left: 20px;
    }

    li {
      color: #495057;
      margin-bottom: 8px;
    }

    .info-modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    button {
      min-width: 120px;
    }
  `]
})
export class InfoModalComponent {
  noMostrarMas = false;

  constructor(
    public dialogRef: MatDialogRef<InfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cerrar(): void {
    if (this.noMostrarMas) {
      localStorage.setItem('noMostrarInfoHistorial', 'true');
    }
    this.dialogRef.close();
  }
} 