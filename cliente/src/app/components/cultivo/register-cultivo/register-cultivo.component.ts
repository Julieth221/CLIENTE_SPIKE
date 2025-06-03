import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { API_URLS } from '../../../../config/api_config';
import { DialogoExitoComponent } from './dialogo-exito.component';

interface TipoArroz {
  Id: number;
  Nombre: string;
}

interface MetodoSiembra {
  Id: number;
  Nombre: string;
}

interface EstadoFenologico {
  Id: number;
  Nombre: string;
}

interface Parcela {
  Id: number;
  NombreParcela: string;
  FkFincaParcela: {
    Id: number;
    Nombre: string;
    Activo: boolean;
  };
  Activo: boolean;
}

interface ParcelaArrendada {
  id_parcela: number;
  id_arrendamiento: number;
  nombre_parcela: string;
  nombre_finca: string;
}

interface RolesUsuario {
  Id: number;
  FkUsuarioRoles: {
    Id: number;
  };
  FkRolesUsuario: {
    Id: number;
    Nombre: string;
  };
  Activo: boolean;
}

@Component({
  selector: 'app-register-cultivo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    // DialogoExitoComponent
  ],
  templateUrl: './register-cultivo.component.html',
  styleUrl: './register-cultivo.component.css'
})
export class RegisterCultivoComponent implements OnInit {
  cultivoForm: FormGroup;
  loading: boolean = false;
  isArrendatario: boolean = false;
  user_id: number | null = null;

  // Arrays para los selects
  tiposArroz: TipoArroz[] = [];
  metodosSiembra: MetodoSiembra[] = [];
  estadosFenologicos: EstadoFenologico[] = [];
  parcelas: Parcela[] = [];
  parcelasArrendadas: ParcelaArrendada[] = [];
  parcelasArrendadasSet: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.cultivoForm = this.fb.group({
      nombreCultivo: ['', [Validators.required, Validators.minLength(3)]],
      idParcela: [null, Validators.required],
      idArrendamiento: [null],
      fkTipoArroz: [null, Validators.required],
      fkMetodoSiembra: [null, Validators.required],
      fkEstadoFenologicoCultivo: [null, Validators.required],
      fechaSiembra: [null, Validators.required],
      cicloDias: [null, [Validators.required, Validators.min(1)]],
      areaSembrada: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.user_id = this.authService.getUserId();
    
    if (!this.user_id) {
      this.snackBar.open('No se pudo obtener la información del usuario. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 5000 });
      return;
    }

    this.verificarRolUsuario();
  }

  verificarRolUsuario(): void {
    this.loading = true;
    this.apiService.get<RolesUsuario[]>(`${API_URLS.CRUD.API_CRUD_USUARIO}/Roles_Usuario?query=FkUsuarioRoles.Id:${this.user_id}`).subscribe({
      next: (response: any) => {
        const roles = response.Data;
        this.isArrendatario = roles.some((rol: RolesUsuario) => rol.FkRolesUsuario.Nombre === 'Arrendatario' && rol.Activo);
        
        this.cargarDatosIniciales();
      },
      error: (error) => {
        console.error('Error al verificar rol de usuario:', error);
        this.snackBar.open('Error al verificar el rol de usuario', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cargarDatosIniciales(): void {
    // Cargar tipos de arroz
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/tipo_arroz?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.tiposArroz = response.Data;
      },
      error: (error) => {
        console.error('Error al cargar tipos de arroz:', error);
        this.snackBar.open('Error al cargar los tipos de arroz', 'Cerrar', { duration: 3000 });
      }
    });

    // Cargar métodos de siembra
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/metodo_siembra?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.metodosSiembra = response.Data;
      },
      error: (error) => {
        console.error('Error al cargar métodos de siembra:', error);
        this.snackBar.open('Error al cargar los métodos de siembra', 'Cerrar', { duration: 3000 });
      }
    });

    // Cargar estados fenológicos
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_CULTIVO}/Estado_fenologico_cultivo?query=Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        this.estadosFenologicos = response.Data;
      },
      error: (error) => {
        console.error('Error al cargar estados fenológicos:', error);
        this.snackBar.open('Error al cargar los estados fenológicos', 'Cerrar', { duration: 3000 });
      }
    });

    // Cargar parcelas según el rol
    if (this.isArrendatario) {
      this.cargarParcelasArrendadas();
    } else {
      this.cargarParcelasPropias();
    }
  }

  cargarParcelasPropias(): void {
    this.loading = true;
    // Primero obtenemos todas las parcelas del propietario
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Parcela?query=FkFincaParcela.Id_Usuario:${this.user_id}`).subscribe({
      next: (response: any) => {
        if (!response || !response.Data || !Array.isArray(response.Data)) {
          console.log('No se encontraron parcelas');
          this.parcelas = [];
          this.loading = false;
          return;
        }

        // Filtrar solo las parcelas activas
        this.parcelas = response.Data.filter((parcela: any) => 
          parcela.Activo === true && 
          parcela.FkFincaParcela?.Activo === true
        );

        // Luego obtenemos los arrendamientos activos para filtrar las parcelas
        this.obtenerArrendamientosActivos();
      },
      error: (error) => {
        console.error('Error al cargar parcelas:', error);
        this.snackBar.open('Error al cargar las parcelas', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  obtenerArrendamientosActivos(): void {
    this.apiService.get(`${API_URLS.MID.API_MID_SPIKE}/arrendamiento/activos/${this.user_id}/`).subscribe({
      next: (response: any) => {
        // Verificar si la respuesta es válida
        if (!response || !Array.isArray(response)) {
          console.log('No hay arrendamientos activos');
          this.parcelasArrendadasSet = new Set();
          this.loading = false;
          return;
        }

        // Crear un conjunto con los nombres de las parcelas arrendadas
        this.parcelasArrendadasSet = new Set(
          response.flatMap((arr: any) => arr.Parcelas || [])
        );
        
        // Filtrar las parcelas para mostrar solo las disponibles
        this.parcelas = this.parcelas.filter(parcela => 
          !this.parcelasArrendadasSet.has(parcela.NombreParcela)
        );
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener arrendamientos activos:', error);
        this.snackBar.open('Error al obtener información de arrendamientos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cargarParcelasArrendadas(): void {
    this.apiService.get(`${API_URLS.CRUD.API_CRUD_FINCA}/Arrendamiento_Parcela?query=FkArrendamiento.IdUserUserArrendatario:${this.user_id}`).subscribe({
      next: (response: any) => {
        const parcelasArrendadas = response.Data;
        const fechaActual = new Date();

        this.parcelasArrendadas = parcelasArrendadas.filter((parcela: any) => {
          const fechaInicio = new Date(parcela.arrendamiento.fecha_inicio);
          const fechaFin = new Date(parcela.arrendamiento.fecha_fin);
          return parcela.arrendamiento.activo && 
                 parcela.arrendamiento_parcela.activo && 
                 fechaActual >= fechaInicio && 
                 fechaActual <= fechaFin;
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar parcelas arrendadas:', error);
        this.snackBar.open('Error al cargar las parcelas arrendadas', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  guardarCultivo(): void {
    if (this.cultivoForm.invalid) {
      this.cultivoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.cultivoForm.value;
    const cultivoData = {
      NombreCultivo: formValue.nombreCultivo,
      Id_Parcela: this.isArrendatario ? formValue.idParcela.id_parcela : formValue.idParcela,
      Id_Arrendamiento: this.isArrendatario ? formValue.idParcela.id_arrendamiento : null,
      FkTipoArroz: formValue.fkTipoArroz,
      FkMetodoSiembra: formValue.fkMetodoSiembra,
      FkEstadoFenologicoCultivo: formValue.fkEstadoFenologicoCultivo,
      FechaSiembra: formValue.fechaSiembra.toISOString(),
      CicloDias: formValue.cicloDias,
      AreaSembrada: formValue.areaSembrada
    };

    this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/gestion_cultivo`, cultivoData).subscribe({
      next: () => {
        this.mostrarDialogoExito();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al registrar cultivo:', error);
        this.snackBar.open('Error al registrar el cultivo', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  mostrarDialogoExito(): void {
    const dialogRef = this.dialog.open(DialogoExitoComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'registro-sensor') {
        this.router.navigate(['dashboard/sensor/registro-t-sensor']);
      }
    });
  }
}
