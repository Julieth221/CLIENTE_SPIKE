import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="chart-container">
      <h2 class="chart-title">{{title}}</h2>
      <div class="chart-wrapper" *ngIf="data && data.length > 0">
        <div class="chart-content">
          <ngx-charts-bar-vertical
            [view]="view"
            [scheme]="colorScheme"
            [results]="data"
            [gradient]="false"
            [xAxis]="true"
            [yAxis]="true"
            [legend]="false"
            [showXAxisLabel]="false"
            [showYAxisLabel]="false"
            [animations]="true"
            [barPadding]="8"
            [roundEdges]="true"
            [showGridLines]="false"
            [xAxisTickFormatting]="formatXAxis"
            [yAxisTickFormatting]="formatYAxis">
          </ngx-charts-bar-vertical>
        </div>
      </div>
      <div class="no-data" *ngIf="!data || data.length === 0">
        <p>No hay datos disponibles para mostrar</p>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin: 1rem 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .chart-title {
      color: #2E7D32;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 500;
      text-align: center;
      width: 100%;
    }

    .chart-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 1rem;
    }

    .chart-content {
      height: 400px;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
    }

    .no-data {
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 1.1rem;
    }

    :host ::ng-deep {
      .ngx-charts {
        text {
          fill: #666;
          font-size: 12px;
          font-weight: 500;
        }

        .gridline-path {
          stroke: none;
        }

        .bar {
          transition: all 0.3s ease;
        }

        .bar:hover {
          opacity: 0.8;
        }

        .x-axis {
          .tick {
            text {
              text-anchor: middle;
              transform: translateY(10px);
            }
          }
        }

        .y-axis {
          .tick {
            text {
              text-anchor: end;
            }
          }
        }

        .ngx-charts-outer {
          margin: 0 auto;
          display: flex;
          justify-content: center;
        }

        .bar {
          width: 40px !important;
        }
      }
    }

    @media (max-width: 1200px) {
      .chart-content {
        height: 350px;
        max-width: 800px;
      }
    }

    @media (max-width: 992px) {
      .chart-content {
        height: 300px;
        max-width: 700px;
      }
    }

    @media (max-width: 768px) {
      .chart-container {
        padding: 1rem;
      }

      .chart-content {
        height: 250px;
        max-width: 600px;
      }

      .chart-title {
        font-size: 1.2rem;
        margin-bottom: 1rem;
      }

      :host ::ng-deep {
        .ngx-charts {
          .bar {
            width: 30px !important;
          }
        }
      }
    }

    @media (max-width: 576px) {
      .chart-content {
        height: 200px;
        max-width: 100%;
      }

      :host ::ng-deep {
        .ngx-charts {
          .bar {
            width: 25px !important;
          }
        }
      }
    }
  `]
})
export class InicioDashboardChartComponent implements OnInit {
  @Input() data: { name: string; value: number }[] = [];
  @Input() title: string = '';

  // Colores que coinciden con las cards del dashboard
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2E7D32', '#42a547', '#67c16b', '#388E3C', '#D32F2F']
  };
  
  view: [number, number] = [900, 400];

  constructor() {
    this.updateView();
  }

  ngOnInit() {
    window.addEventListener('resize', () => this.updateView());
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.updateView());
  }

  private updateView() {
    const width = window.innerWidth;
    if (width <= 576) {
      this.view = [width - 40, 200];
    } else if (width <= 768) {
      this.view = [width - 60, 250];
    } else if (width <= 992) {
      this.view = [width - 80, 300];
    } else if (width <= 1200) {
      this.view = [width - 100, 350];
    } else {
      this.view = [900, 400];
    }
  }

  formatXAxis(value: string): string {
    return value.length > 15 ? value.substring(0, 12) + '...' : value;
  }

  formatYAxis(value: number): string {
    return value.toString();
  }
} 