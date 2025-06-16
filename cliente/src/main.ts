import { bootstrapApplication } from '@angular/platform-browser';
import { LoginComponent } from './app/components/login/login.component';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RegisterComponent } from './app/components/register/register.component';
import { AppComponent } from './app/app.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { provideHttpClient } from '@angular/common/http';
import { HomeComponent } from './app/components/home/home.component';
import { ForgotPassComponent } from './app/components/forgot-pass/forgot-pass.component';
import { VerifyCodeComponent } from './app/components/verify-code/verify-code.component';
import { PwdRecoveryComponent } from './app/components/pwd-recovery/pwd-recovery.component';
import { PwdSuccessComponent } from './app/components/pwd-success/pwd-success.component';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { FincaRegisterComponent } from './app/components/finca/finca-register/finca-register.component';
import { ArrendatarioRegisterComponent } from './app/components/finca/arrendatario-register/arrendatario-register.component';
import { ArrendamientoRegisterComponent } from './app/components/finca/arrendamiento-register/arrendamiento-register.component';
import { TablaFincasComponent } from './app/components/finca/tablaFincas/tablaFincas.component';
import { CardFincasComponent } from './app/components/finca/card-fincas/card-fincas.component';
import { RegisterTipoSueloComponent } from './app/components/finca/register-tipo-suelo/register-tipo-suelo.component';
import { TablaArrendamientosComponent } from './app/components/finca/tabla-arrendamientos/tabla-arrendamientos.component';
import { GestionSensoresComponent } from './app/components/sensor/gestion-sensores/gestion-sensores.component';
import { VerArrendamientosComponent } from './app/components/finca/ver-arrendamientos/ver-arrendamientos.component';
import { AlertasSensorComponent } from './app/components/sensor/alertas-sensor/alertas-sensor.component';
import { LocalizarSensorComponent } from './app/components/sensor/localizar-sensor/localizar-sensor.component';
import { ProbarSensorComponent } from './app/components/sensor/probar-sensor/probar-sensor.component';
import { RegistroTSensorComponent } from './app/components/sensor/registro-t-sensor/registro-t-sensor.component';
import { RegistroSensorComponent } from './app/components/sensor/registro-sensor/registro-sensor.component';
import { ConfigAlertComponent } from './app/components/sensor/config-alert/config-alert.component';
import { EditAlertComponent } from './app/components/sensor/edit-alert/edit-alert.component';
import { VersensorComponent } from './app/components/sensor/versensor/versensor.component';
import { GestionAlertComponent } from './app/components/sensor/gestion-alert/gestion-alert.component';
import { EditarFincaComponent } from './app/components/finca/editar-finca/editar-finca.component';
import { HistorialAlertComponent } from './app/components/sensor/historial-alert/historial-alert.component';
import { EditarArrendamientosComponent } from './app/components/finca/editar-arrendamientos/editar-arrendamientos.component';
import { HistorialParcelaComponent } from './app/components/finca/historial-parcela/historial-parcela.component';
import { DatosCultivoComponent } from './app/components/cultivo/datos-cultivo/datos-cultivo.component';
import { RegisterCultivoComponent } from './app/components/cultivo/register-cultivo/register-cultivo.component';
import { FasesCultivoComponent } from './app/components/cultivo/fases-cultivo/fases-cultivo.component';
import { RegisterInsumoCultivoComponent } from './app/components/cultivo/register-insumo-cultivo/register-insumo-cultivo.component';
import { DashboardCultivoComponent } from './app/components/cultivo/dashboard-cultivo/dashboard-cultivo.component';
import { TablaCultivoComponent } from './app/components/cultivo/tabla-cultivo/tabla-cultivo.component';
import { HistorialInsumoComponent } from './app/components/cultivo/historial-insumo/historial-insumo.component';
import { MiPerfilComponent } from './app/components/mi-perfil/mi-perfil.component';
import { NoAutorizadoComponent } from './app/components/no-autorizado/no-autorizado.component';
import { AuthGuard } from './app/guards/auth.guard';
import { AdminGuard, PropietarioGuard, ArrendatarioGuard } from './app/guards/role.guard';
import { UsuariosComponent } from './app/components/admin/usuarios/usuarios.component';
import { InicioDashboardComponent } from './app/components/inicio-dashboard/inicio-dashboard.component';
import { customColorScheme } from './app/config/chart.config';
import { RegisterAdminComponent } from './app/components/admin/register-admin/register-admin.component';

// Configurar el esquema de colores global para ngx-charts
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

bootstrapApplication(AppComponent,{
    providers:[
        provideRouter([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'login', component: LoginComponent },
            { path: 'forgotPassword', component: ForgotPassComponent },
            { path: 'verifyCode', component: VerifyCodeComponent },
            { path: 'pwdRecovery', component: PwdRecoveryComponent },
            { path: 'pwdSuccess', component: PwdSuccessComponent },
            { path: 'register', component: RegisterComponent },
            { 
              path: 'register-admin', 
              component: RegisterAdminComponent,
              // canActivate: [AuthGuard, AdminGuard],
              // data: { roles: ['ADMIN'] }
            },
            { path: 'no-autorizado', component: NoAutorizadoComponent },
            {
              path: 'dashboard',
              component: DashboardComponent,
              canActivate: [AuthGuard],
              children: [
                  // Rutas de usuarios (solo ADMIN)
                  { 
                    path: 'usuarios', 
                    component: UsuariosComponent,
                    canActivate: [AdminGuard],
                    data: { roles: ['ADMIN'] }
                  },

                  { 
                    path: 'inicio', 
                    component: InicioDashboardComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  
                  // Rutas de finca (ADMIN y PROPIETARIO)
                  { 
                    path: 'finca/registrar', 
                    component: FincaRegisterComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/arrendatario', 
                    component: ArrendatarioRegisterComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/arrendamiento', 
                    component: ArrendamientoRegisterComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/verFincas', 
                    component: TablaFincasComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/verCardFincas', 
                    component: CardFincasComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/datosFinca', 
                    component: RegisterTipoSueloComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/datosArrendamiento', 
                    component: TablaArrendamientosComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/arrendamientodetalle', 
                    component: VerArrendamientosComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/editarFinca', 
                    component: EditarFincaComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/editararrendamiento', 
                    component: EditarArrendamientosComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  { 
                    path: 'finca/historialParcela', 
                    component: HistorialParcelaComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO'] }
                  },
                  
                  // Rutas de cultivo (todos los roles)
                  { 
                    path: 'cultivo/datosCultivo', 
                    component: DatosCultivoComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'cultivo/registrarCultivo', 
                    component: RegisterCultivoComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'cultivo/fasesCultivo', 
                    component: FasesCultivoComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'cultivo/registrarInsumo', 
                    component: RegisterInsumoCultivoComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'cultivo/estadoCultivo', 
                    component: DashboardCultivoComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'cultivo/verCultivo', 
                    component: TablaCultivoComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'cultivo/historirialInsumo', 
                    component: HistorialInsumoComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  
                  // Rutas de sensores (todos los roles)
                  { 
                    path: 'sensor/gestion-sensores', 
                    component: GestionSensoresComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/alertas-sensor', 
                    component: AlertasSensorComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/localizar-sensor', 
                    component: LocalizarSensorComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/probar-sensor', 
                    component: ProbarSensorComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/registro-t-sensor', 
                    component: RegistroTSensorComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/registro-sensor', 
                    component: RegistroSensorComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/config-alert', 
                    component: ConfigAlertComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/edit-alert', 
                    component: EditAlertComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/verSensor', 
                    component: VersensorComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/gestion-alert', 
                    component: GestionAlertComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  { 
                    path: 'sensor/historial-alert', 
                    component: HistorialAlertComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  },
                  
                  // Ruta de perfil (todos los roles)
                  { 
                    path: 'MiPerfil', 
                    component: MiPerfilComponent,
                    canActivate: [PropietarioGuard],
                    data: { roles: ['ADMIN', 'PROPIETARIO', 'ARRENDATARIO'] }
                  }
              ]
            },
            { path: '**', redirectTo: 'no-autorizado' }
          ]),
        provideAnimations(),
        provideHttpClient(),
        importProvidersFrom(MatDialogModule),
        { provide: 'NGX_CHARTS_COLOR_SCHEME', useValue: customColorScheme }
    ]
}).catch(err => console.error(err));
