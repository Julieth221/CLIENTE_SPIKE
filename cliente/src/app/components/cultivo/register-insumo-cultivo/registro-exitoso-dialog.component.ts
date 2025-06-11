import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-exitoso-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="success-modal">
      <div class="success-circle">
        <mat-icon>check</mat-icon>
      </div>
      <div class="success-message">
        ¡Insumo registrado con éxito!
      </div>
    </div>
  `,
  styles: [`
    .success-modal {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1.5rem;
    }
    .success-circle {
      width: 100px;
      height: 100px;
      background: #1de9b6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      box-shadow: 0 0 0 4px #64ffda33;
      animation: pop 0.4s;
    }
    .success-circle mat-icon {
      color: #fff;
      font-size: 3.5rem;
    }
    .success-message {
      font-size: 1.2rem;
      color: #222;
      text-align: center;
      font-weight: 500;
    }
    @keyframes pop {
      0% { transform: scale(0.7);}
      100% { transform: scale(1);}
    }
  `]
})
export class RegistroExitosoDialogComponent {
  constructor(public dialogRef: MatDialogRef<RegistroExitosoDialogComponent>) {}
} 