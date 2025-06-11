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
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { Router } from '@angular/router';

interface Parcela {
  id: number;
  label: string;
}

interface Cultivo {
  id: number;
  nombre: string;
  finca: string;
  parcela: string;
  areaSembrada: number;
  tipoArroz: string;
  fechaSiembra: string;
  etapaFenologica: string;
  activo: boolean;
  sugerenciaNuevoArrendamiento: boolean;
}

@Component({
  selector: 'app-tabla-cultivo',
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
  templateUrl: './tabla-cultivo.component.html',
  styleUrl: './tabla-cultivo.component.css'
})
export class TablaCultivoComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'nombre',
    'finca',
    'areaSembrada',
    'tipoArroz',
    'fechaSiembra',
    'etapaFenologica',
    'estado',
    'acciones'
  ];

  dataSource = new MatTableDataSource<Cultivo>([]);
  parcelas: Parcela[] = [];
  parcelaSeleccionada: number | null = null;

  // Estados
  loading: boolean = false;
  errorMessage: string = '';
  noDataMessage: string = 'Seleccione una parcela para ver sus cultivos asociados.';

  // Filtros
  searchText: string = '';
  filterEtapa: string = '';
  filterTipoArroz: string = '';
  filterEstado: string = '';
  etapaOptions: string[] = ['germinación', 'desarrollo', 'maduración', 'cosecha'];
  tipoArrozOptions: string[] = ['Arroz Blanco', 'Arroz Integral', 'Arroz Rojo'];
  estadoOptions: string[] = ['Activo', 'Inactivo'];

  constructor(
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarParcelas();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  cargarParcelas(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/gestion_cultivo/parcelas/seleccionables`).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.parcelas = response.data;
          if (this.parcelas.length === 0) {
            this.noDataMessage = 'No hay parcelas disponibles para seleccionar.';
          }
        } else {
          this.errorMessage = 'No se pudieron cargar las parcelas';
          this.parcelas = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
        this.errorMessage = 'Error al cargar las parcelas. Por favor, intente nuevamente.';
        this.parcelas = [];
        this.loading = false;
      }
    });
  }

  onParcelaChange(parcelaId: number): void {
    if (!parcelaId) {
      this.dataSource.data = [];
      return;
    }
    this.parcelaSeleccionada = parcelaId;
    this.loading = true;
    this.errorMessage = '';

    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/gestion_cultivo/cultivos/${parcelaId}`).subscribe({
      next: (response: any) => {
        if (response && response.data === null) {
          this.noDataMessage = 'Esta parcela no tiene cultivos registrados actualmente.';
          this.dataSource.data = [];
        } else if (response && response.data) {
          if (response.data.length === 0) {
            this.noDataMessage = 'Esta parcela no tiene cultivos registrados actualmente.';
            this.dataSource.data = [];
          } else {
            this.dataSource.data = response.data;
            this.noDataMessage = '';
          }
        } else {
          this.errorMessage = 'Error al cargar los datos de los cultivos';
          this.dataSource.data = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.errorMessage = 'Error al cargar los cultivos. Por favor, intente nuevamente.';
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let filteredData = [...this.dataSource.data];

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchLower) ||
          item.finca.toLowerCase().includes(searchLower) ||
          item.tipoArroz.toLowerCase().includes(searchLower)
      );
    }

    if (this.filterEtapa) {
      filteredData = filteredData.filter(
        (item) => item.etapaFenologica === this.filterEtapa
      );
    }

    if (this.filterTipoArroz) {
      filteredData = filteredData.filter(
        (item) => item.tipoArroz === this.filterTipoArroz
      );
    }

    if (this.filterEstado) {
      filteredData = filteredData.filter(
        (item) => (item.activo ? 'Activo' : 'Inactivo') === this.filterEstado
      );
    }

    this.dataSource.data = filteredData;
  }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  verCultivo(cultivo: Cultivo): void {
    // Implementar lógica para ver detalles del cultivo
    console.log('Ver cultivo:', cultivo);
  }

  editarCultivo(cultivo: Cultivo): void {
    // Implementar lógica para editar cultivo
    console.log('Editar cultivo:', cultivo);
  }

  eliminarCultivo(cultivo: Cultivo): void {
    // Implementar lógica para eliminar cultivo
    console.log('Eliminar cultivo:', cultivo);
  }

  RegistrarCultivo(){
    this.router.navigate(['/dashboard/cultivo/registrarCultivo'])
  }
}
