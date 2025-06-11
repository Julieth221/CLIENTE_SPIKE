import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialogo-exito',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-content">
      <mat-icon class="success-icon">check_circle</mat-icon>
      <h2>¡Cultivo registrado correctamente!</h2>
      <p>Para tener un monitoreo de cultivo de arroz completo, registre sus sensores en la sección de Registro de Sensor.</p>
      <div class="dialog-actions">
        <button mat-raised-button color="primary" (click)="irARegistroSensor()">
          Ir al Registro de Sensor
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-content {
      padding: 24px;
      text-align: center;
    }
    .success-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #4caf50;
      margin-bottom: 16px;
    }
    h2 {
      margin: 0 0 16px;
      color: #333;
    }
    p {
      margin: 0 0 24px;
      color: #666;
    }
    .dialog-actions {
      display: flex;
      justify-content: center;
    }
  `]
})
export class DialogoExitoComponent {
  constructor(private dialogRef: MatDialogRef<DialogoExitoComponent>) {}

  irARegistroSensor(): void {
    this.dialogRef.close('registro-sensor');
  }
} 