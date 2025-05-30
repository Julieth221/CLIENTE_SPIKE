import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RegisterTipoArrozComponent } from '../register-tipo-arroz/register-tipo-arroz.component';
import { RegisterEstadoFenologicoComponent } from '../register-estado-fenologico/register-estado-fenologico.component';
import { RegisterMetodoSiembraComponent } from '../register-metodo-siembra/register-metodo-siembra.component';
import { RegisterCategoriaInsumoComponent } from '../register-categoria-insumo/register-categoria-insumo.component';

@Component({
  selector: 'app-datos-cultivo',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RegisterTipoArrozComponent,
    RegisterEstadoFenologicoComponent,
    RegisterMetodoSiembraComponent,
    RegisterCategoriaInsumoComponent
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Datos del Cultivo</mat-card-title>
          <mat-card-subtitle>
            Registra y gestiona los datos maestros necesarios para el monitoreo de cultivos de arroz
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-horizontal-stepper linear>
            <mat-step label="Tipo de Arroz">
              <app-register-tipo-arroz></app-register-tipo-arroz>
            </mat-step>
            <mat-step label="Estado Fenológico">
              <app-register-estado-fenologico></app-register-estado-fenologico>
            </mat-step>
            <mat-step label="Método de Siembra">
              <app-register-metodo-siembra></app-register-metodo-siembra>
            </mat-step>
            <mat-step label="Categoría de Insumo">
              <app-register-categoria-insumo></app-register-categoria-insumo>
            </mat-step>
          </mat-horizontal-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      background: white;
      min-height: calc(100vh - 64px);
    }
    
    mat-card {
      margin-bottom: 2rem;
    }
    
    mat-card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #747a80;
      margin-bottom: 0.5rem;
    }
    
    mat-card-subtitle {
      color: #667085;
      margin-bottom: 1.5rem;
    }
    
    ::ng-deep .mat-horizontal-stepper-header-container {
      margin-bottom: 2rem;
    }
    
    ::ng-deep .mat-step-header {
      background-color: #f8f9fa;
      border-radius: 8px;
      margin: 0 8px;
    }
    
    ::ng-deep .mat-step-header .mat-step-icon {
      background-color: #016165;
      color: white;
    }
    
    ::ng-deep .mat-step-header .mat-step-label {
      color: #344054;
      font-weight: 500;
    }
    
    ::ng-deep .mat-step-header .mat-step-icon-selected {
      background-color: #016165;
    }
    
    ::ng-deep .mat-step-header .mat-step-icon-state-done {
      background-color: #28C76F;
    }
  `]
})
export class DatosCultivoComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
} 