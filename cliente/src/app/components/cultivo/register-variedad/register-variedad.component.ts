import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';

interface Variedad {
  Id?: number;
  Nombre: string;
  FkTipoCultivo: number;
  Activo?: boolean;
  FkUsuario?: number;
}

interface TipoCultivo {
  Id: number;
  Nombre: string;
}

@Component({
  selector: 'app-register-variedad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule
  ],
  template: `
    <div class="container">
      <div class="form-section" *ngIf="!loading">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ editing ? 'Editar Variedad' : 'Registrar Variedad' }}</mat-card-title>
            <mat-card-subtitle>Administra las variedades de cultivo que usarás en tu sistema.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="variedadForm" (ngSubmit)="guardarVariedad()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre de la variedad</mat-label>
                  <input matInput formControlName="nombre" placeholder="Ej: Tomate Cherry">
                  <mat-icon matSuffix>🌱</mat-icon>
                  <mat-error *ngIf="variedadForm.get('nombre')?.hasError('required')">
                    El nombre es obligatorio
                  </mat-error>
                  <mat-error *ngIf="variedadForm.get('nombre')?.hasError('minlength')">
                    El nombre debe tener al menos 3 caracteres
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tipo de cultivo</mat-label>
                  <mat-select formControlName="fkTipoCultivo">
                    <mat-option *ngFor="let tipo of tiposCultivo" [value]="tipo.Id">
                      {{ tipo.Nombre | titlecase }}
                    </mat-option>
                  </mat-select>
                  <mat-icon matSuffix>🌿</mat-icon>
                  <mat-error *ngIf="variedadForm.get('fkTipoCultivo')?.hasError('required')">
                    El tipo de cultivo es obligatorio
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                  <mat-icon>{{ editing ? 'save' : 'add' }}</mat-icon>
                  {{ editing ? 'Actualizar' : 'Registrar' }}
                </button>
                
                <button mat-button type="button" *ngIf="editing" (click)="cancelarEdicion()">
                  Cancelar
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="list-section">
        <h2>Variedades Registradas</h2>
        
        <div *ngIf="loading" class="loader-container">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
        
        <div *ngIf="!loading && variedades.length === 0" class="empty-state">
          <mat-icon>🌱</mat-icon>
          <p>No hay variedades registradas</p>
        </div>
        
        <div class="cards-grid" *ngIf="!loading && variedades.length > 0">
          <mat-card class="tipo-card" *ngFor="let variedad of variedades">
            <div class="tipo-content">
              <div class="tipo-chip">
                <span>{{ variedad.Nombre | titlecase }}</span>
              </div>
              <div class="tipo-subtitle">
                {{ getTipoCultivoNombre(variedad.FkTipoCultivo) | titlecase }}
              </div>
            </div>
            <div class="card-actions">
              <button mat-icon-button color="primary" matTooltip="Editar" (click)="editarVariedad(variedad)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Eliminar" (click)="eliminarVariedad(variedad)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 2rem;
      background: white;
      min-height: calc(100vh - 64px);
      color: #667085;
    }
    
    .title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #747a80;
      letter-spacing: 0.5px;
      text-align: center;
    }
    
    mat-card-title {
      margin-bottom: 0.8rem;
    }
    
    mat-card-subtitle {
      margin-bottom: 0.8rem;
    }
    
    .form-section {
      width: 100%;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-row {
      margin-bottom: 16px;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    
    .form-actions button {
      color: #3B7F4D;
    }
    
    .form-actions button:hover {
      background-color: #f0fff4;
    }
    
    .list-section {
      width: 100%;
    }
    
    .list-section h2 {
      font-size: 1.2rem;
      color: #344054;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }
    
    .tipo-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border: 1px solid #EAECF0;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    
    .tipo-card:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    .tipo-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .tipo-chip {
      padding: 6px 12px;
      border-radius: 16px;
      font-weight: 500;
      color: white;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      letter-spacing: 0.5px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      background-color: #016165;
    }
    
    .tipo-subtitle {
      font-size: 0.8rem;
      color: #667085;
      margin-left: 4px;
    }
    
    .card-actions {
      display: flex;
      gap: 4px;
    }
    
    .loader-container {
      display: flex;
      justify-content: center;
      margin: 32px 0;
    }
    
    .empty-state {
      text-align: center;
      padding: 48px 0;
      color: #667085;
    }
    
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #D0D5DD;
      margin-bottom: 16px;
    }
    
    @media (max-width: 768px) {
      .container {
        flex-direction: column;
      }
      
      .form-section, .list-section {
        width: 100%;
      }
      
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RegisterVariedadComponent implements OnInit {
  variedadForm: FormGroup;
  variedades: Variedad[] = [];
  tiposCultivo: TipoCultivo[] = [];
  loading: boolean = false;
  editing: boolean = false;
  currentVariedadId: number | null = null;
  user_id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.variedadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      fkTipoCultivo: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.cargarTiposCultivo();
    this.cargarVariedades();
  }

  cargarTiposCultivo(): void {
    if (!this.user_id) return;
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/tipo_cultivo?query=FkUsuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.tiposCultivo = response.Data;
      },
      error: (error) => {
        console.error('Error al cargar tipos de cultivo:', error);
        this.snackBar.open('Error al cargar los tipos de cultivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cargarVariedades(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/variedad?query=FkUsuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.variedades = response.Data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar variedades:', error);
        this.snackBar.open('Error al cargar las variedades', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getTipoCultivoNombre(tipoCultivoId: number): string {
    const tipoCultivo = this.tiposCultivo.find(tipo => tipo.Id === tipoCultivoId);
    return tipoCultivo ? tipoCultivo.Nombre : 'Tipo no encontrado';
  }

  guardarVariedad(): void {
    if (this.variedadForm.invalid || !this.user_id) {
      this.variedadForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const variedadData: Variedad = {
      Nombre: this.variedadForm.value.nombre.toLowerCase().trim(),
      FkTipoCultivo: this.variedadForm.value.fkTipoCultivo,
      FkUsuario: this.user_id,
      Activo: true
    };

    const variedadExistente = this.variedades.find(
      variedad => variedad.Nombre.toLowerCase() === variedadData.Nombre && 
                  variedad.FkTipoCultivo === variedadData.FkTipoCultivo
    );

    if (variedadExistente && !this.editing) {
      this.snackBar.open('Esta variedad ya está registrada para este tipo de cultivo', 'Cerrar', { duration: 3000 });
      this.loading = false;
      return;
    }

    if (this.editing && this.currentVariedadId) {
      this.apiService.put(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/variedad/${this.currentVariedadId}`,
        variedadData
      ).subscribe({
        next: () => {
          this.snackBar.open('Variedad actualizada correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarVariedades();
        },
        error: (error) => {
          console.error('Error al actualizar variedad:', error);
          this.snackBar.open('Error al actualizar la variedad', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.apiService.post(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/variedad`,
        variedadData
      ).subscribe({
        next: () => {
          this.snackBar.open('Variedad registrada correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarVariedades();
        },
        error: (error) => {
          console.error('Error al registrar variedad:', error);
          this.snackBar.open('Error al registrar la variedad', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editarVariedad(variedad: Variedad): void {
    this.editing = true;
    this.currentVariedadId = variedad.Id ?? null;
    this.variedadForm.patchValue({
      nombre: variedad.Nombre,
      fkTipoCultivo: variedad.FkTipoCultivo
    });
  }

  eliminarVariedad(variedad: Variedad): void {
    if (!variedad.Id) {
      this.snackBar.open('Error: ID de la variedad no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm(`¿Está seguro de eliminar la variedad "${variedad.Nombre}"?`)) {
      this.loading = true;
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_CULTIVO}/variedad/${variedad.Id}`).subscribe({
        next: () => {
          this.snackBar.open('Variedad eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.cargarVariedades();
        },
        error: (error) => {
          console.error('Error al eliminar variedad:', error);
          this.snackBar.open('Error al eliminar la variedad', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.variedadForm.reset();
    this.editing = false;
    this.currentVariedadId = null;
    this.loading = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }
} 