import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';


// Interfaces para los modelos de la API
interface TipoDocumento {
  Id: number;
  Descripcion: string;
  Activo: boolean;
  FechaCreacion: string;
  FechaModificacion: string;
}

interface Credenciales {
  Id: number;
  CorreoElectronico: string;
  // Añadir otras propiedades si son necesarias
}

interface Usuario {
  Id: number;
  Nombre: string;
  Apellido: string;
  Contacto: string;
  TipoDocumento: TipoDocumento;
  NumeroDocumento: string;
  CorreoElectronico: string;
  Activo: boolean;
  FechaCreacion: string; // O Date si se parsea a objeto Date
  FechaModificacion: string;
  FkCredencial: Credenciales;
}

interface Roles {
  Id: number;
  Nombre: string;
  Activo: boolean;
  FechaCreacion: string;
  FechaModificacion: string;
}

interface RolesUsuario {
  Id: number;
  FkUsuarioRoles: Usuario;
  FkRolesUsuario: Roles;
  Activo: boolean;
  FechaCreacion: string;
  FechaModificacion: string;
}

// Interfaz para la tabla de usuarios con el rol incluido
interface UsuarioConRol extends Usuario {
  Rol: string;
}


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSelectModule,
    FormsModule,
    MatChipsModule
  ],
  providers: [DatePipe],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<UsuarioConRol>([]);
  displayedColumns: string[] = [
    'nombre',
    'rol',
    'correo',
    'contacto',
    'tipoDocumento',
    'numeroDocumento',
    'fechaRegistro',
    'estado',
    'acciones'
  ];

  loading: boolean = true;
  searchText: string = '';
  filterRol: string = '';
  filterEstado: string = '';

  roleOptions: string[] = [];
  statusOptions: { value: string; viewValue: string }[] = [
    { value: 'true', viewValue: 'Activo' },
    { value: 'false', viewValue: 'Inactivo' }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.createFilterPredicate();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const usersResponse: any = await this.apiService.get<Usuario[]>(`${API_URLS.CRUD.API_CRUD_USUARIO}/Usuario`).toPromise();
      const rolesUsersResponse: any = await this.apiService.get<RolesUsuario[]>(`${API_URLS.CRUD.API_CRUD_USUARIO}/Roles_Usuario?query=Activo:true`).toPromise();

      if (usersResponse.Success && usersResponse.Data && rolesUsersResponse.Success && rolesUsersResponse.Data) {
        const users: Usuario[] = Array.isArray(usersResponse.Data) ? usersResponse.Data : [usersResponse.Data];
        const rolesUsuarios: RolesUsuario[] = Array.isArray(rolesUsersResponse.Data) ? rolesUsersResponse.Data : [rolesUsersResponse.Data];
        
        // Mapear los roles a los usuarios
        const usersWithRoles: UsuarioConRol[] = users.map(user => {
          const userRole = rolesUsuarios.find(ru => ru.FkUsuarioRoles.Id === user.Id);
          return {
            ...user,
            Rol: userRole ? userRole.FkRolesUsuario.Nombre : 'Sin Rol'
          };
        });

        this.dataSource.data = usersWithRoles;
        this.roleOptions = [...new Set(usersWithRoles.map(u => u.Rol))].sort();
        this.applyFilter(); // Aplicar filtros iniciales si los hay
      } else {
        console.error('Error: La respuesta de la API no contiene la propiedad Data o Success es false.');
        this.dataSource.data = [];
      }
    } catch (error) {
      console.error('Error al cargar los usuarios o sus roles:', error);
      this.dataSource.data = [];
    } finally {
      this.loading = false;
    }
  }

  createFilterPredicate() {
    return (data: UsuarioConRol, filter: string) => {
      const searchTerms = JSON.parse(filter);

      const searchMatch = 
        data.Nombre.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
        data.Apellido.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
        data.CorreoElectronico.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
        data.NumeroDocumento.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
        data.Contacto.toLowerCase().includes(searchTerms.searchText.toLowerCase());

      const roleMatch = !searchTerms.filterRol || data.Rol === searchTerms.filterRol;
      const statusMatch = searchTerms.filterEstado === '' || data.Activo.toString() === searchTerms.filterEstado;
      
      return searchMatch && roleMatch && statusMatch;
    };
  }

  applyFilter() {
    const filterValue = JSON.stringify({
      searchText: this.searchText,
      filterRol: this.filterRol,
      filterEstado: this.filterEstado
    });
    
    this.dataSource.filter = filterValue;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addNewUser() {
    this.router.navigate(['/dashboard/register-admin']); // O a la ruta de registro general si aplica
  }

  editUser(user: UsuarioConRol) {
    // Implementar lógica para editar usuario, por ejemplo, navegar a un componente de edición
    alert('Editar usuario: ' + user.Nombre);
    // this.router.navigate(['/dashboard/usuarios/edit', user.Id]);
  }

  deleteUser(user: UsuarioConRol) {
    if (confirm(`¿Está seguro de eliminar al usuario "${user.Nombre} ${user.Apellido}"?`)) {
      this.apiService.delete(`${API_URLS.CRUD.API_CRUD_USUARIO}/Usuario/${user.Id}`).subscribe({
        next: () => {
          alert('Usuario eliminado exitosamente');
          this.loadUsers(); // Recargar la tabla
        },
        error: (error) => {
          console.error('Error al eliminar el usuario:', error);
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'mediumDate') || '';
  }
}
