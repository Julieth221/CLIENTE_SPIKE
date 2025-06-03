import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface EtapaFenologica {
  nombre: string;
  duracion: string;
  descripcion: string;
  caracteristicas: string[];
  recomendaciones: string[];
  icono: string;
}

@Component({
  selector: 'registro-etapa-dialog',
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <span class="etapa-icon">{{ data.icono }}</span>
        Registrar Etapa: {{ data.nombre }}
      </h2>
      
      <form [formGroup]="registroForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha de Inicio</mat-label>
              <input matInput [matDatepicker]="inicioPicker" formControlName="fechaInicio" required>
              <mat-datepicker-toggle matSuffix [for]="inicioPicker"></mat-datepicker-toggle>
              <mat-datepicker #inicioPicker></mat-datepicker>
              <mat-error *ngIf="registroForm.get('fechaInicio')?.hasError('required')">
                La fecha de inicio es obligatoria
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Fecha de Finalización</mat-label>
              <input matInput [matDatepicker]="finPicker" formControlName="fechaFin" required>
              <mat-datepicker-toggle matSuffix [for]="finPicker"></mat-datepicker-toggle>
              <mat-datepicker #finPicker></mat-datepicker>
              <mat-error *ngIf="registroForm.get('fechaFin')?.hasError('required')">
                La fecha de finalización es obligatoria
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Observaciones</mat-label>
              <textarea matInput formControlName="observaciones" rows="4"
                        placeholder="Ingrese observaciones adicionales sobre la etapa..."></textarea>
            </mat-form-field>
          </div>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            <mat-icon>close</mat-icon>
            Cancelar
          </button>
          <button mat-raised-button color="primary" type="submit" [disabled]="registroForm.invalid">
            <mat-icon>save</mat-icon>
            Registrar Etapa
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      max-width: 500px;
    }

    .etapa-icon {
      font-size: 1.5em;
      margin-right: 10px;
    }

    .form-row {
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      padding: 20px 0;
    }

    mat-dialog-actions {
      padding: 20px 0 0;
      gap: 10px;
    }

    button[mat-raised-button] {
      min-width: 120px;
    }

    mat-icon {
      margin-right: 8px;
    }

    textarea {
      min-height: 100px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class RegistroEtapaDialog {
  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RegistroEtapaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: EtapaFenologica
  ) {
    this.registroForm = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      observaciones: ['']
    });
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.dialogRef.close({
        ...this.registroForm.value,
        completada: true
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 