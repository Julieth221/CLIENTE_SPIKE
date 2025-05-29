import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { InfoModalComponent } from './info-modal/info-modal.component';
import { TimelineComponent } from './timeline/timeline.component';
import { AuthService } from '../../../../services/auth.service';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { finalize } from 'rxjs/operators';

pdfMake.vfs = pdfFonts.vfs;

interface ParcelaOriginal {
  Id: number;
  Nombre: string;
}

interface Arrendamiento {
  id: number;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  valor: string;
  arrendatario: string;
  parcelasAdicionales: string[];
}

interface VersionParcela {
  nombre: string;
  version: number;
  tamano: number;
  motivoCambio: string;
  fechaCreacion: string;
  arrendamientos: Arrendamiento[];
}

interface ParcelaHistorial {
  parcelaVersion: string;
  tamano: number;
  fechaCreacion: Date;
  arrendamiento: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  arrendatario: string;
  parcelasEnArrendamiento: string[];
  arrendamientoAnterior: string;
  estado: string;
  valor: number;
  motivoCambio: string;
}

@Component({
  selector: 'app-historial-parcela',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatSortModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TimelineComponent
  ],
  providers: [DatePipe],
  templateUrl: './historial-parcela.component.html',
  styleUrl: './historial-parcela.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistorialParcelaComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'parcela',
    'version',
    'tamano',
    'motivoCambio',
    'fechaCreacion',
    // 'arrendamiento',
    'arrendatario',
    'valor',
    'estado'
  ];

  dataSource = new MatTableDataSource<any>([]);
  fincas: any[] = [];
  fincaSeleccionada: number | null = null;
  parcelas: ParcelaOriginal[] = [];
  parcelaSeleccionada: number | null = null;
  mostrarTimeline: boolean = false;
  versionSeleccionada: string = '';
  userId: number = 0;
  nombreCompletoPropietario: string = '';

  // Estados
  loading: boolean = false;
  errorMessage: string = '';
  noDataMessage: string = '';

  // Filtros
  searchText: string = '';
  filterEstado: string = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  estadoOptions: string[] = ['Activo', 'Inactivo'];

  // Datos dinámicos para el informe
  nombrePropietario: string = '';
  apellidoPropietario: string = '';
  nombreFinca: string = '';
  nombreParcela: string = '';

  constructor(
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getIdFromToken();
    if (!this.userId) {
      this.errorMessage = 'No se pudo obtener el ID del usuario';
      return;
    }

    // Obtener datos del propietario
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_USUARIO}/Usuario/${this.userId}`).subscribe({
      next: (response: any) => {
        if (response.Success && response.Data) {
          this.nombrePropietario = response.Data.Nombre;
          this.apellidoPropietario = response.Data.Apellido;

          this.nombreCompletoPropietario = `${this.nombrePropietario} ${this.apellidoPropietario}`;
        }
      },
      error: (error) => {
        console.error('Error al obtener datos del propietario:', error);
      }
    });

    this.mostrarModalInfo();
    this.mostrarTimeline = false;
    this.loading = false;
    this.errorMessage = '';
    this.noDataMessage = '';
    this.obtenerFincasUsuario();
  }

  obtenerFincasUsuario() {
    if (!this.userId) {
      this.errorMessage = 'No se pudo obtener el ID del usuario';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Finca?query=Id_Usuario:${this.userId}`).subscribe({
      next: (response: any) => {
        if (response && response.Data && Array.isArray(response.Data)) {
          this.fincas = response.Data;
          if (this.fincas.length === 0) {
            this.noDataMessage = 'No se encontraron fincas asociadas a su usuario';
          }
        } else {
          this.errorMessage = 'No se pudieron cargar las fincas';
          this.fincas = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar fincas:', error);
        this.errorMessage = 'Error al cargar las fincas. Por favor, intente nuevamente.';
        this.fincas = [];
        this.loading = false;
      }
    });
  }

  onFincaChange(fincaId: number): void {
    if (!fincaId) {
      this.parcelas = [];
      this.dataSource.data = [];
      this.nombreFinca = '';
      return;
    }
    this.fincaSeleccionada = fincaId;
    this.parcelaSeleccionada = null;
    this.dataSource.data = [];
    this.loading = true;
    this.errorMessage = '';
    // Guardar el nombre de la finca seleccionada
    const finca = this.fincas.find(f => f.Id === fincaId);
    this.nombreFinca = finca ? finca.Nombre : '';

    this.apiService.get<any[]>(`${API_URLS.MID.API_MID_SPIKE}/historial_parcela/parcelas/originales/${fincaId}`).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.parcelas = response.map(p => ({
            Id: p.Id,
            Nombre: p.Nombre
          }));
          if (this.parcelas.length === 0) {
            this.noDataMessage = 'No hay parcelas originales en esta finca';
          } else {
            this.noDataMessage = '';
          }
        } else {
          this.errorMessage = 'Formato de respuesta inválido';
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
      this.nombreParcela = '';
      return;
    }
    this.parcelaSeleccionada = parcelaId;
    this.loading = true;
    this.errorMessage = '';
    // Guardar el nombre de la parcela seleccionada
    const parcela = this.parcelas.find(p => p.Id === parcelaId);
    this.nombreParcela = parcela ? parcela.Nombre : '';

    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/historial_parcela/parcelaversiones/${parcelaId}`).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          if (response.length === 0) {
            this.noDataMessage = 'No hay historial disponible para esta parcela';
            this.dataSource.data = [];
          } else {
            this.dataSource.data = this.transformarDatosParaTabla(response);
            this.noDataMessage = '';
          }
        } else {
          this.errorMessage = 'Formato de respuesta inválido';
          this.dataSource.data = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historial:', error);
        this.errorMessage = 'Error al cargar el historial de la parcela. Por favor, intente nuevamente.';
        this.dataSource.data = [];
        this.loading = false;
      }
    });
  }

  transformarDatosParaTabla(historial: any[]): ParcelaHistorial[] {
    return historial.flatMap(version => {
      if (!version.arrendamientos || version.arrendamientos.length === 0) {
        return [{
          parcelaVersion: `${version.nombre} (v${version.version})`,
          tamano: version.tamano,
          fechaCreacion: new Date(version.fechaCreacion),
          arrendamiento: '-',
          fechaInicio: null,
          fechaFin: null,
          arrendatario: '-',
          parcelasEnArrendamiento: [],
          arrendamientoAnterior: '-',
          estado: 'Sin arrendamiento',
          valor: 0,
          motivoCambio: version.motivoCambio || 'Sin motivo especificado'
        }];
      }

      return version.arrendamientos.map((arrendamiento: any) => ({
        parcelaVersion: `${version.nombre} (v${version.version})`,
        tamano: version.tamano,
        fechaCreacion: new Date(version.fechaCreacion),
        arrendamiento: `A${arrendamiento.id}`,
        fechaInicio: new Date(arrendamiento.fechaInicio),
        fechaFin: new Date(arrendamiento.fechaFin),
        arrendatario: arrendamiento.arrendatario || '-',
        parcelasEnArrendamiento: arrendamiento.parcelasAdicionales || [],
        arrendamientoAnterior: '-',
        estado: arrendamiento.estado || 'Inactivo',
        valor: parseFloat(arrendamiento.valor) || 0,
        motivoCambio: version.motivoCambio || 'Sin motivo especificado'
      }));
    });
  }

  transformarDatosParaTimeline(data: ParcelaHistorial[]): VersionParcela[] {
    const versionesMap = new Map<string, VersionParcela>();
    
    data.forEach(item => {
      const versionKey = item.parcelaVersion;
      if (!versionesMap.has(versionKey)) {
        versionesMap.set(versionKey, {
          nombre: item.parcelaVersion.split(' ')[0],
          version: parseInt(item.parcelaVersion.split('v')[1]),
          tamano: item.tamano,
          motivoCambio: item.motivoCambio,
          fechaCreacion: item.fechaCreacion.toISOString(),
          arrendamientos: []
        });
      }

      if (item.arrendamiento !== '-') {
        const version = versionesMap.get(versionKey)!;
        version.arrendamientos.push({
          id: parseInt(item.arrendamiento.replace('A', '')),
          estado: item.estado,
          fechaInicio: item.fechaInicio?.toISOString() || '',
          fechaFin: item.fechaFin?.toISOString() || '',
          valor: item.valor.toString(),
          arrendatario: item.arrendatario,
          parcelasAdicionales: item.parcelasEnArrendamiento
        });
      }
    });

    return Array.from(versionesMap.values()).sort((a, b) => a.version - b.version);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  mostrarModalInfo(): void {
    if (!localStorage.getItem('noMostrarInfoHistorial')) {
      this.dialog.open(InfoModalComponent, {
        width: '600px',
        disableClose: true
      });
    }
  }

  verTimeline(version: string): void {
    this.versionSeleccionada = version;
    this.mostrarTimeline = true;
  }

  volverATabla(): void {
    this.mostrarTimeline = false;
    this.versionSeleccionada = '';
  }

  applyFilter(): void {
    let filteredData = [...this.dataSource.data];

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.parcelaVersion.toLowerCase().includes(searchLower) ||
          item.arrendatario.toLowerCase().includes(searchLower) ||
          item.arrendamiento.toLowerCase().includes(searchLower)
      );
    }

    if (this.filterEstado) {
      filteredData = filteredData.filter(
        (item) => item.estado === this.filterEstado
      );
    }

    if (this.fechaInicio) {
      filteredData = filteredData.filter(
        (item) => new Date(item.fechaInicio) >= this.fechaInicio!
      );
    }
    if (this.fechaFin) {
      filteredData = filteredData.filter(
        (item) => new Date(item.fechaFin) <= this.fechaFin!
      );
    }

    this.dataSource.data = filteredData;
  }

  exportToExcel(): void {
    const data = this.dataSource.filteredData.map((item) => ({
      'Parcela (Versión)': item.parcelaVersion,
      'Tamaño (m2)': item.tamano,
      'Motivo Cambio': item.motivoCambio,
      'Fecha Creación': this.datePipe.transform(
        item.fechaCreacion,
        'dd/MM/yyyy'
      ),
      Arrendamiento: item.arrendamiento,
      'Fecha Inicio': this.datePipe.transform(item.fechaInicio, 'dd/MM/yyyy'),
      'Fecha Fin': this.datePipe.transform(item.fechaFin, 'dd/MM/yyyy'),
      Arrendatario: item.arrendatario,
      'Parcelas en Arrendamiento': item.parcelasEnArrendamiento.join(', '),
      'Arrendamiento Anterior': item.arrendamientoAnterior,
      'Valor': item.valor
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { Historial: worksheet },
      SheetNames: ['Historial'],
    };
    XLSX.writeFile(workbook, 'historial_parcelas.xlsx');
  }

  private calcularResumenEjecutivo(data: ParcelaHistorial[]): any {
    const versionesUnicas = new Set(data.map((item) => item.parcelaVersion));
    const arrendamientosUnicos = new Set(
      data.filter(item => item.arrendamiento !== '-' && item.arrendatario !== '-')
          .map((item) => item.arrendamiento)
    );

    const duraciones = data
      .filter(item => item.fechaInicio && item.fechaFin && item.arrendamiento !== '-' && item.arrendatario !== '-')
      .map((item) => {
        const inicio = item.fechaInicio!;
        const fin = item.fechaFin!;
        return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30); // en meses
      });

    const duracionPromedio =
      duraciones.length > 0
        ? duraciones.reduce((a, b) => a + b, 0) / duraciones.length
        : 0;

    const ultimaVersion = data.sort(
      (a, b) =>
        b.fechaCreacion.getTime() -
        a.fechaCreacion.getTime()
    )[0];

    const parcelasDerivadas = data
      .flatMap((item) => item.parcelasEnArrendamiento)
      .filter((parcela) => parcela !== this.nombreParcela);

    return {
      totalVersiones: versionesUnicas.size,
      totalArrendamientos: arrendamientosUnicos.size,
      duracionPromedio: duracionPromedio.toFixed(1),
      ultimaVersion: ultimaVersion ? ultimaVersion.parcelaVersion : '',
      ultimoArrendatario: ultimaVersion ? ultimaVersion.arrendatario : '',
      parcelasDerivadas: [...new Set(parcelasDerivadas)],
    };
  }

  async exportToPDF(): Promise<void> {
    const data = this.dataSource.filteredData;
    // Separar versiones con y sin arrendamiento
    const conArrendamiento = data.filter(item => item.arrendamiento !== '-' && item.arrendatario !== '-');
    const sinArrendamiento = data.filter(item => item.arrendamiento === '-' || item.arrendatario === '-');
    // Calcular resumen solo con arrendamientos reales
    const resumen = this.calcularResumenEjecutivo(conArrendamiento);
    const fechaGeneracion = this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm');
    const logoBase64 = await this.getBase64ImageFromURL('logo3.png');

    const footer = function (currentPage: number, pageCount: number) {
      return {
        columns: [
          { text: 'Reporte confidencial generado por SPIKE', color: '#888', fontSize: 9 },
          {
            text: `Página ${currentPage} de ${pageCount}`,
            alignment: 'right',
            color: '#888',
            fontSize: 9,
          },
        ],
        margin: [40, 0, 40, 0],
      };
    };

    // Construcción del PDF
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      footer,
      content: [
        // HEADER
        {
          columns: [
            { image: logoBase64, width: 70, margin: [0, 0, 10, 0] },
            [
              { text: 'INFORME DE HISTORIAL DE PARCELAS', style: 'header' },
              { text: fechaGeneracion, style: 'subheader' },
            ],
          ],
          columnGap: 20,
          margin: [0, 0, 0, 10],
          style: 'headerBlock',
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1.5,
              lineColor: '#016165',
            },
          ],
          margin: [0, 0, 0, 10],
        },
        // INFORMACIÓN INSTITUCIONAL
        {
          style: 'infoBlock',
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Propietario', style: 'infoLabel' },
                { text: 'Finca', style: 'infoLabel' },
                { text: 'Parcela', style: 'infoLabel' },
              ],
              [
                { text: this.nombreCompletoPropietario, style: 'infoValue' },
                { text: this.nombreFinca, style: 'infoValue' },
                { text: this.nombreParcela, style: 'infoValue' },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 20],
        },
        // RESUMEN EJECUTIVO
        {
          style: 'summaryBlock',
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  text: `Total versiones:\n${data.length}`,
                  style: 'kpi',
                  alignment: 'center',
                },
                {
                  text: `Arrendamientos únicos:\n${resumen.totalArrendamientos}`,
                  style: 'kpi',
                  alignment: 'center',
                },
                {
                  text: `Duración promedio:\n${resumen.duracionPromedio} meses`,
                  style: 'kpi',
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 10],
        },
        {
          text:
            `El historial de la parcela muestra un total de ${data.length} versiones y ${resumen.totalArrendamientos} arrendamientos únicos. ` +
            `La duración promedio de los arrendamientos es de ${resumen.duracionPromedio} meses. ` +
            (resumen.ultimaVersion
              ? `La última versión activa es ${resumen.ultimaVersion} con el arrendatario ${resumen.ultimoArrendatario}.`
              : '') +
            (resumen.parcelasDerivadas.length > 0
              ? ` Parcelas derivadas: ${resumen.parcelasDerivadas.join(', ')}.`
              : ''),
          style: 'summaryText',
          margin: [0, 0, 0, 20],
        },
        // DETALLE DE ARRENDAMIENTOS
        conArrendamiento.length > 0 ? {
          text: 'DETALLE DE ARRENDAMIENTOS',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10],
        } : {},
        ...conArrendamiento.map((item) => [
          {
            style: 'arrendamientoBlock',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [
                      {
                        text: `Arrendamiento`,
                        style: 'arrendamientoHeader',
                      },
                      {
                        text: this.formatCurrency(item.valor),
                        style: 'valorHeader',
                        alignment: 'right',
                      },
                    ],
                  },
                ],
                [
                  {
                    columns: [
                      {
                        text:
                          `Arrendatario: ${item.arrendatario}\n` +
                          `Período: ${this.formatDate(item.fechaInicio)} - ${this.formatDate(item.fechaFin)}`,
                        style: 'arrendamientoInfo',
                      },
                    ],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 10, 0, 0],
          },
          {
            style: 'arrendamientoTable',
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Parcela (Versión)', style: 'tableHeader' },
                  { text: 'Tamaño', style: 'tableHeader' },
                  { text: 'Fecha creación', style: 'tableHeader' },
                  { text: 'Valor', style: 'tableHeader' },
                ],
                [
                  item.parcelaVersion,
                  `${item.tamano} m2`,
                  this.formatDate(item.fechaCreacion),
                  this.formatCurrency(item.valor),
                ],
              ],
            },
            layout: {
              fillColor: (rowIndex: number) =>
                rowIndex === 0
                  ? '#ecfffe'
                  : rowIndex % 2 === 0
                  ? '#f9f9f9'
                  : null,
            },
            margin: [0, 0, 0, 20],
          },
        ]),
        // SECCIÓN DE VERSIONES SIN ARRENDAMIENTO
        sinArrendamiento.length > 0 ? {
          text: 'VERSIONES SIN ARRENDAMIENTO',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10],
        } : {},
        ...sinArrendamiento.map((item) => [
          {
            style: 'arrendamientoBlock',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    columns: [
                      {
                        text: `Sin arrendamiento registrado para esta versión`,
                        style: 'arrendamientoHeader',
                        color: '#888'
                      }
                    ],
                  },
                ],
              ],
            },
            layout: 'noBorders',
            margin: [0, 10, 0, 0],
          },
          {
            style: 'arrendamientoTable',
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Parcela (Versión)', style: 'tableHeader' },
                  { text: 'Tamaño', style: 'tableHeader' },
                  { text: 'Fecha creación', style: 'tableHeader' },
                  { text: 'Valor', style: 'tableHeader' },
                ],
                [
                  item.parcelaVersion,
                  `${item.tamano} m2`,
                  this.formatDate(item.fechaCreacion),
                  this.formatCurrency(item.valor),
                ],
              ],
            },
            layout: {
              fillColor: (rowIndex: number) =>
                rowIndex === 0
                  ? '#f5f5f5'
                  : rowIndex % 2 === 0
                  ? '#f9f9f9'
                  : null,
            },
            margin: [0, 0, 0, 20],
          },
        ]),
      ],
      styles: {
        header: {
          fontSize: 20,
          bold: true,
          color: '#016165',
          margin: [0, 0, 0, 2],
        },
        subheader: { fontSize: 10, color: '#888', alignment: 'right' },
        headerBlock: { margin: [0, 0, 0, 10] },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#016165',
          margin: [0, 10, 0, 10],
        },
        infoBlock: { fillColor: '#f5f7fa', margin: [0, 0, 0, 20] },
        infoLabel: { bold: true, color: '#016165', fontSize: 11 },
        infoValue: { color: '#222', fontSize: 11 },
        summaryBlock: { fillColor: '#e3f2fd', margin: [0, 0, 0, 10] },
        kpi: {
          fontSize: 13,
          bold: true,
          color: '#016165',
          alignment: 'center',
        },
        summaryText: { fontSize: 11, color: '#444', margin: [0, 0, 0, 20] },
        arrendamientoBlock: { fillColor: '#f8f9fa', margin: [0, 10, 0, 0] },
        arrendamientoHeader: { fontSize: 14, bold: true, color: '#016165' },
        valorHeader: { fontSize: 14, bold: true, color: '#5e7a98' },
        arrendamientoInfo: { fontSize: 11, color: '#333' },
        arrendamientoTable: { margin: [0, 0, 0, 20] },
        tableHeader: {
          fillColor: '#ecfffe',
          bold: true,
          color: '#016165',
          fontSize: 11,
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`Historial_Parcela_${this.nombreParcela}.pdf`);
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  private getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = url;
    });
  }

  toggleTimeline(mostrar: boolean): void {
    this.mostrarTimeline = mostrar;
  }

  getNombreParcelaSeleccionada(): string {
    if (!this.parcelaSeleccionada || !this.parcelas) {
      return 'seleccionada';
    }
    const parcela = this.parcelas.find(p => p.Id === this.parcelaSeleccionada);
    return parcela ? parcela.Nombre : 'seleccionada';
  }
}
