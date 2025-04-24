import { Component, ViewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table'; 
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CardFincasComponent } from '../card-fincas/card-fincas.component';

@Component({
  selector: 'app-tablaFincas',
  imports: [
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSortModule,
    MatPaginatorModule,
    FormsModule,
    MatTableModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatRippleModule,
    MatButtonToggleModule,
    CardFincasComponent
  ],
  templateUrl: './tablaFincas.component.html',
  styleUrl: './tablaFincas.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TablaFincasComponent implements OnInit, AfterViewInit {
  // Referencias para paginación y ordenamiento
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Control de vista
  vistaActual: 'tabla' | 'tarjeta' = 'tabla';

  // Datos y filtrados
  fincas: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  expandedElement: any | null = null;

  // Filtros
  searchText: string = '';
  filterParcela: string = '';
  filterSuelo: string = '';

  // Opciones para filtros
  parcelaOptions: number[] = [];
  tipoSueloOptions: string[] = [];
  
  // Estado
  loading: boolean = true;

  // Columnas para mostrar
  displayedColumns: string[] = ['nombre', 'ubicacion', 'tamano', 'parcelas', 'suelo', 'acciones'];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  private isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // Cambiar automáticamente a vista de tarjetas en móvil
    if (this.isMobileView()) {
      this.vistaActual = 'tarjeta';
    }
  }

  ngOnInit(): void {
    // Establecer vista inicial basada en el tamaño de la pantalla
    this.vistaActual = this.isMobileView() ? 'tarjeta' : 'tabla';
    this.obtenerFincas();
  }

  ngAfterViewInit() {
    // Configurar paginación y ordenamiento después de que se inicialicen las vistas
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  obtenerFincas() {
    this.loading = true;

    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/finca/`).subscribe({
      next: (response: any) => {
        this.fincas = response;
        this.dataSource.data = this.fincas;
        
        // Obtener opciones únicas para los filtros
        this.parcelaOptions = [...new Set(this.fincas.map(f => f.TotalParcelas))].sort((a, b) => a - b);
        this.tipoSueloOptions = [...new Set(this.fincas.map(f => f.TipoSuelo))].sort();
        
        // Configurar el filtro personalizado
        this.dataSource.filterPredicate = this.createFilterPredicate();
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener las fincas:', error);
        this.loading = false;
      }
    });
  }

  createFilterPredicate() {
    return (data: any, filter: string) => {
      const searchTerms = JSON.parse(filter);
      const nombreMatch = data.Nombre.toLowerCase().includes(searchTerms.searchText.toLowerCase());
      const parcelaMatch = !searchTerms.filterParcela || data.TotalParcelas === +searchTerms.filterParcela;
      const sueloMatch = !searchTerms.filterSuelo || data.TipoSuelo === searchTerms.filterSuelo;
      
      return nombreMatch && parcelaMatch && sueloMatch;
    };
  }

  applyFilter() {
    const filterValue = JSON.stringify({
      searchText: this.searchText,
      filterParcela: this.filterParcela,
      filterSuelo: this.filterSuelo
    });
    
    this.dataSource.filter = filterValue;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  registrarFinca() {
    this.router.navigate(['/dashboard/finca/registrar']);
  }

  editarFinca(finca: any) {
    this.router.navigate(['/finca/editar', finca.ID]);
  }

  eliminarFinca(finca: any) {
    if (confirm(`¿Está seguro de eliminar la finca "${finca.Nombre}"?`)) {
      this.apiService.delete(`${API_URLS.MID.API_MID_SPIKE}/finca/${finca.ID}`).subscribe({
        next: () => {
          this.obtenerFincas();
        },
        error: (error) => {
          console.error('Error al eliminar la finca:', error);
        }
      });
    }
  }
}
