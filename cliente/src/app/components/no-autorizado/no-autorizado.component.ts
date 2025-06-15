import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-no-autorizado',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <mat-icon class="warning-icon">gpp_bad</mat-icon>
        <h1 class="title">Acceso Denegado</h1>
        <p class="message">
          Lo sentimos, no tienes los permisos necesarios para acceder a esta sección.
        </p>
        <button mat-raised-button color="primary" routerLink="/home" class="back-button">
          <mat-icon>arrow_back</mat-icon>
          Volver al inicio
        </button>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
      padding: 20px;
    }

    .unauthorized-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 480px;
      width: 100%;
      transform: translateY(-20px);
      animation: slideUp 0.5s ease forwards;
    }

    .warning-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #dc2626;
      margin-bottom: 24px;
    }

    .title {
      color: #1f2937;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .message {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 32px;
    }

    .back-button {
      background-color: #0B7D2F;
      color: white;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .back-button:hover {
      background-color: #025828;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(11, 125, 47, 0.2);
    }

    .back-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 640px) {
      .unauthorized-card {
        padding: 24px;
      }

      .warning-icon {
        font-size: 60px;
        width: 60px;
        height: 60px;
      }

      .title {
        font-size: 24px;
      }

      .message {
        font-size: 14px;
      }
    }
  `]
})
export class NoAutorizadoComponent {} 