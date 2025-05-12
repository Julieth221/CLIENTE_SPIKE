import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { VerMapaComponent } from '../ver-mapa/ver-mapa.component';


// Interfaces para manejar la estructura de datos
interface Parcela {
  Id: number;
  NombreParcela: string;
  TamanoParcela: number;
}

interface Geolocalizacion {
  Id: number;
  LatitudInicial: string;
  LongitudInicial: string;
  LatitudFinal: string;
  LongitudFinal: string;
}

interface FincaParcela {
  Id: number;
  FkParcelaFinca: Parcela;
  FkGeolocalizacion: Geolocalizacion;
  AreaTotalParcelas: number;
}

@Component({
  selector: 'app-verfincas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    VerMapaComponent
  ],
  providers: [DatePipe],
  templateUrl: './verfincas.component.html',
  styleUrl: './verfincas.component.css'
})
export class VerfincasComponent implements OnInit {
  // Datos de la finca
  nombreFinca: string = '';
  AreaTotal: number = 0;
  totalParcelas: number = 0 ;
  parcelas: FincaParcela[] = [];
  AreaTotalParcelas: number = 0;
  
  // Estado
  loading: boolean = true;
  errorMessage: string = '';
  
  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VerfincasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { fincaId: number, nombreFinca: string }
  ) {}
  
  ngOnInit(): void {
    if (!this.data?.fincaId) {
      this.errorMessage = 'No se proporcionó el ID de la finca';
      this.loading = false;
      this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
      return;
    }
    
    this.nombreFinca = this.data.nombreFinca;
    this.cargarDatosFinca();
  }
  
  cargarDatosFinca(): void {
    this.loading = true;
    
    // Obtener las parcelas de la finca
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/FincaParcela?query=FkFincaParcela.Id:${this.data.fincaId}`)
      .subscribe({
        next: (response: any) => {
          if (response && response.Data && Array.isArray(response.Data)) {
            this.parcelas = response.Data;
            this.totalParcelas = this.parcelas.length;
            
            
            
            // Calcular área total
            this.AreaTotal = this.parcelas.reduce((total, parcela) => {
              return total + (parcela.FkParcelaFinca?.TamanoParcela || 0);
            }, 0);

             // Calcular área total de todas las parcelas
            this.AreaTotalParcelas = 0;
            this.parcelas.forEach(parcela => {
              this.AreaTotalParcelas += parcela.FkParcelaFinca?.TamanoParcela || 0;
            });
            
            this.loading = false;
            
          } else {
            this.errorMessage = 'No se encontraron parcelas para esta finca';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error al cargar las parcelas:', error);
          this.errorMessage = 'Error al cargar los datos de la finca';
          this.snackBar.open(this.errorMessage, 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }
  
  onClose(): void {
    this.dialogRef.close();
  }
  
  getCoordenadas(geolocalizacion: Geolocalizacion): any {
    return {
      latitudInicial: parseFloat(geolocalizacion.LatitudInicial),
      longitudInicial: parseFloat(geolocalizacion.LongitudInicial),
      latitudFinal: parseFloat(geolocalizacion.LatitudFinal),
      longitudFinal: parseFloat(geolocalizacion.LongitudFinal)
    };
  }
}
