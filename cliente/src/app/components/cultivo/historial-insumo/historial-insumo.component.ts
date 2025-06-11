import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { Router } from '@angular/router';

interface Cultivo {
  Id: number;
  Nombre: string;
  FechaSiembra: string;
  CicloDias: number;
  FkEstadoFenologicoCultivo: {
    Id: number;
    Nombre: string;
  };
  FkMetodoSiembra: {
    Id: number;
    Nombre: string;
  };
  AreaSembrada: number;
  Activo: boolean;
}

interface Insumo {
  cantidadAplicada: number;
  categoriaInsumo: string;
  fechaAplicacion: string;
  metodoAplicacion: string;
  nombreInsumo: string;
  observaciones: string;
  tipoInsumo: string;
}

@Component({
  selector: 'app-historial-insumo',
  standalone: true,
  imports: [
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatSortModule,
    MatCardModule,
    FormsModule
  ],
  providers: [DatePipe],
  templateUrl: './historial-insumo.component.html',
  styleUrl: './historial-insumo.component.css'
})
export class HistorialInsumoComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'nombreInsumo',
    'categoriaInsumo',
    'tipoInsumo',
    'cantidadAplicada',
    'metodoAplicacion',
    'fechaAplicacion',
    'observaciones'
  ];

  dataSource = new MatTableDataSource<Insumo>([]);
  cultivos: Cultivo[] = [];
  cultivoSeleccionado: number | null = null;

  // Estados
  loading: boolean = false;
  errorMessage: string = '';
  noDataMessage: string = 'Por favor seleccione un cultivo para visualizar los insumos aplicados.';

  // Filtros
  searchText: string = '';
  filterCategoria: string = '';
  filterTipo: string = '';
  categoriaOptions: string[] = [];
  tipoOptions: string[] = [];

  constructor(
    private datePipe: DatePipe,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCultivos();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  cargarCultivos(): void {
    this.loading = true;
    this.errorMessage = '';
    const userId = this.authService.getUserId();

    if (!userId) {
      this.errorMessage = 'No se pudo obtener el ID del usuario';
      this.loading = false;
      return;
    }

    this.apiService.get<Cultivo[]>(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Registro_Cultivo?query=Id_Usuario:${userId}`).subscribe({
      next: (response: any) => {
        if (response && response.Data) {
          this.cultivos = response.Data.filter((cultivo: Cultivo) => cultivo.Activo);
          if (this.cultivos.length === 0) {
            this.noDataMessage = 'No hay cultivos activos disponibles';
          }
        } else {
          this.errorMessage = 'No se pudieron cargar los cultivos';
          this.cultivos = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.errorMessage = 'Error al cargar los cultivos. Por favor, intente nuevamente.';
        this.cultivos = [];
        this.loading = false;
      }
    });
  }

  onCultivoChange(cultivoId: number): void {
    if (!cultivoId) {
      this.dataSource.data = [];
      return;
    }
    this.cultivoSeleccionado = cultivoId;
    this.loading = true;
    this.errorMessage = '';

    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/gestion_cultivo/insumo/porcultivo/${cultivoId}`).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          if (response.data.length === 0) {
            this.noDataMessage = 'Este cultivo no tiene insumos registrados hasta el momento.';
            this.dataSource.data = [];
          } else {
            this.dataSource.data = response.data;
            this.noDataMessage = '';
            // Actualizar opciones de filtros
            this.actualizarOpcionesFiltros(response.data);
          }
        } else {
          this.errorMessage = 'Formato de respuesta inválido';
          this.dataSource.data = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar insumos:', error);
        this.errorMessage = 'Error al cargar los insumos. Por favor, intente nuevamente.';
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  actualizarOpcionesFiltros(insumos: Insumo[]): void {
    this.categoriaOptions = [...new Set(insumos.map(i => i.categoriaInsumo))];
    this.tipoOptions = [...new Set(insumos.map(i => i.tipoInsumo))];
  }

  applyFilter(): void {
    let filteredData = [...this.dataSource.data];

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.nombreInsumo.toLowerCase().includes(searchLower) ||
          item.categoriaInsumo.toLowerCase().includes(searchLower) ||
          item.tipoInsumo.toLowerCase().includes(searchLower)
      );
    }

    if (this.filterCategoria) {
      filteredData = filteredData.filter(
        (item) => item.categoriaInsumo === this.filterCategoria
      );
    }

    if (this.filterTipo) {
      filteredData = filteredData.filter(
        (item) => item.tipoInsumo === this.filterTipo
      );
    }

    this.dataSource.data = filteredData;
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  RegistrarInsumo() {
    
      this.router.navigate(['/dashboard/cultivo/registrarInsumo']);
    
  }
}
