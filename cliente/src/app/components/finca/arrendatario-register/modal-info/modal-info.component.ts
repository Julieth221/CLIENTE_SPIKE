import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal-info',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="modal-container">
      <div class="modal-header">
        <mat-icon class="icon" [class.warning]="data.type === 'warning'" [class.error]="data.type === 'error'">
          {{ data.type === 'warning' ? 'warning' : 'error' }}
        </mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>

      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="closeDialog()">Entendido</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .modal-container {
      padding: 20px;
      max-width: 400px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .warning {
      color: #FF9F43;
    }

    .error {
      color: #EA5455;
    }

    h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.25rem;
    }

    mat-dialog-content {
      color: #5E5873;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }

    mat-dialog-actions {
      padding: 0;
      margin: 0;
    }

    button {
      color: #3B7F4D;
    }

    button:hover {
      background-color: #f0fff4;
    }
  `]
})
export class ModalInfoComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      type: 'warning' | 'error';
    }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
} 