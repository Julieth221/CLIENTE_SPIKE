import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="metric-card" [style.--card-color]="color">
      <div class="card-content">
        <div class="icon-container">
          <mat-icon>{{icon}}</mat-icon>
        </div>
        <div class="metric-info">
          <h3 class="metric-title">{{title}}</h3>
          <p class="metric-count">{{count}}</p>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .metric-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
      height: 100%;
    }

    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }

    .card-content {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .icon-container {
      background: var(--card-color);
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .icon-container mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .metric-info {
      flex: 1;
    }

    .metric-title {
      color: #666;
      font-size: 1rem;
      margin: 0 0 0.5rem;
      font-weight: 500;
    }

    .metric-count {
      color: var(--card-color);
      font-size: 2rem;
      font-weight: 600;
      margin: 0;
    }

    @media (max-width: 768px) {
      .card-content {
        padding: 1rem;
        gap: 1rem;
      }

      .icon-container {
        width: 40px;
        height: 40px;
      }

      .metric-count {
        font-size: 1.75rem;
      }
    }
  `]
})
export class InicioDashboardCardComponent {
  @Input() title: string = '';
  @Input() count: number = 0;
  @Input() icon: string = '';
  @Input() color: string = '#2E7D32';
} 