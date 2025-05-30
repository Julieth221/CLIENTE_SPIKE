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
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';

interface MetodoSiembra {
  Id?: number;
  Nombre: string;
  Activo?: boolean;
  FkUsuario?: number;
}

@Component({
  selector: 'app-register-metodo-siembra',
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
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <div class="form-section" *ngIf="!loading">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ editing ? 'Editar Método de Siembra' : 'Registrar Método de Siembra' }}</mat-card-title>
            <mat-card-subtitle>Administra los métodos de siembra que usarás en tus cultivos.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="metodoSiembraForm" (ngSubmit)="guardarMetodoSiembra()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre del método de siembra</mat-label>
                  <input matInput formControlName="nombre" placeholder="Ej: Siembra directa">
                  <mat-icon matSuffix>🌱</mat-icon>
                  <mat-error *ngIf="metodoSiembraForm.get('nombre')?.hasError('required')">
                    El nombre es obligatorio
                  </mat-error>
                  <mat-error *ngIf="metodoSiembraForm.get('nombre')?.hasError('minlength')">
                    El nombre debe tener al menos 3 caracteres
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
        <h2>Métodos de Siembra Registrados</h2>
        
        <div *ngIf="loading" class="loader-container">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
        
        <div *ngIf="!loading && metodosSiembra.length === 0" class="empty-state">
          <mat-icon>🌱</mat-icon>
          <p>No hay métodos de siembra registrados</p>
        </div>
        
        <div class="cards-grid" *ngIf="!loading && metodosSiembra.length > 0">
          <mat-card class="tipo-card" *ngFor="let metodo of metodosSiembra">
            <div class="tipo-content">
              <div class="tipo-chip">
                <span>{{ metodo.Nombre | titlecase }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button mat-icon-button color="primary" matTooltip="Editar" (click)="editarMetodoSiembra(metodo)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Eliminar" (click)="eliminarMetodoSiembra(metodo)">
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
      align-items: center;
      gap: 12px;
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
export class RegisterMetodoSiembraComponent implements OnInit {
  metodoSiembraForm: FormGroup;
  metodosSiembra: MetodoSiembra[] = [];
  loading: boolean = false;
  editing: boolean = false;
  currentMetodoSiembraId: number | null = null;
  user_id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.metodoSiembraForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.cargarMetodosSiembra();
  }

  cargarMetodosSiembra(): void {
    if (!this.user_id) return;
    
    this.loading = true;
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra?query=FkUsuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.metodosSiembra = response.Data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar métodos de siembra:', error);
        this.snackBar.open('Error al cargar los métodos de siembra', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  guardarMetodoSiembra(): void {
    if (this.metodoSiembraForm.invalid || !this.user_id) {
      this.metodoSiembraForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const metodoSiembraData: MetodoSiembra = {
      Nombre: this.metodoSiembraForm.value.nombre.toLowerCase().trim(),
      FkUsuario: this.user_id,
      Activo: true
    };

    const metodoSiembraExistente = this.metodosSiembra.find(
      metodo => metodo.Nombre.toLowerCase() === metodoSiembraData.Nombre
    );

    if (metodoSiembraExistente && !this.editing) {
      this.snackBar.open('Este método de siembra ya está registrado', 'Cerrar', { duration: 3000 });
      this.loading = false;
      return;
    }

    if (this.editing && this.currentMetodoSiembraId) {
      this.apiService.put(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra/${this.currentMetodoSiembraId}`,
        metodoSiembraData
      ).subscribe({
        next: () => {
          this.snackBar.open('Método de siembra actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarMetodosSiembra();
        },
        error: (error) => {
          console.error('Error al actualizar método de siembra:', error);
          this.snackBar.open('Error al actualizar el método de siembra', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.apiService.post(
        `${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra`,
        metodoSiembraData
      ).subscribe({
        next: () => {
          this.snackBar.open('Método de siembra registrado correctamente', 'Cerrar', { duration: 3000 });
          this.resetForm();
          this.cargarMetodosSiembra();
        },
        error: (error) => {
          console.error('Error al registrar método de siembra:', error);
          this.snackBar.open('Error al registrar el método de siembra', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  editarMetodoSiembra(metodoSiembra: MetodoSiembra): void {
    this.editing = true;
    this.currentMetodoSiembraId = metodoSiembra.Id ?? null;
    this.metodoSiembraForm.patchValue({
      nombre: metodoSiembra.Nombre
    });
  }

  eliminarMetodoSiembra(metodoSiembra: MetodoSiembra): void {
    if (!metodoSiembra.Id) {
      this.snackBar.open('Error: ID del método de siembra no disponible', 'Cerrar', { duration: 3000 });
      return;
    }

    if (confirm(`¿Está seguro de eliminar el método de siembra "${metodoSiembra.Nombre}"?`)) {
      this.loading = true;
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra/${metodoSiembra.Id}`).subscribe({
        next: () => {
          this.snackBar.open('Método de siembra eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.cargarMetodosSiembra();
        },
        error: (error) => {
          console.error('Error al eliminar método de siembra:', error);
          this.snackBar.open('Error al eliminar el método de siembra', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.metodoSiembraForm.reset();
    this.editing = false;
    this.currentMetodoSiembraId = null;
    this.loading = false;
  }

  cancelarEdicion(): void {
    this.resetForm();
  }
}
