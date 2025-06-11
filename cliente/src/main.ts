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
// import { MapsSensorComponent } from './app/components/sensor/maps-sensor/maps-sensor.component';
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
            { path: 'verArrendamiento', component: VerArrendamientosComponent},
            // { path: 'sensor/maps-sensor', component: MapsSensorComponent},
            {
              path: 'dashboard',
              component: DashboardComponent,
              children: [
                  { path: 'sensor/registro-t-sensor', component: RegistroTSensorComponent},
                  { path: 'sensor/registro-sensor', component: RegistroSensorComponent},
                  { path: 'finca/registrar', component: FincaRegisterComponent },
                  { path: 'finca/arrendatario', component: ArrendatarioRegisterComponent },
                  { path: 'finca/arrendamiento', component: ArrendamientoRegisterComponent },
                  { path: 'finca/verFincas', component: TablaFincasComponent },
                  { path: 'finca/verCardFincas', component: CardFincasComponent },
                  { path: 'finca/datosFinca', component: RegisterTipoSueloComponent },
                  { path: 'finca/datosArrendamiento', component: TablaArrendamientosComponent},
                  { path: 'finca/arrendamientodetalle', component: VerArrendamientosComponent},
                  { path: 'finca/editarFinca', component: EditarFincaComponent},
                  { path: 'sensor/gestion-sensores', component: GestionSensoresComponent },
                  { path: 'finca/verArrendamiento', component: VerArrendamientosComponent},
                  { path: 'sensor/alertas-sensor', component: AlertasSensorComponent},
                  { path: 'sensor/localizar-sensor', component: LocalizarSensorComponent},
                  { path: 'sensor/probar-sensor', component: ProbarSensorComponent},
                  { path: 'sensor/config-alert', component: ConfigAlertComponent},
                  { path: 'sensor/edit-alert', component: EditAlertComponent},
                  { path: 'sensor/verSensor', component: VersensorComponent},
                  { path: 'sensor/gestion-alert', component: GestionAlertComponent},
                // { path: 'finca/verArrendamiento', component: VerArrendamientosComponent},
                  { path: 'sensor/historial-alert', component: HistorialAlertComponent},
                  { path: 'finca/editararrendamiento', component: EditarArrendamientosComponent},
                  { path: 'finca/historialParcela', component: HistorialParcelaComponent},
                  { path: 'cultivo/datosCultivo', component: DatosCultivoComponent},
                  { path: 'cultivo/registrarCultivo', component: RegisterCultivoComponent},
                  { path: 'cultivo/fasesCultivo', component: FasesCultivoComponent},
                  { path: 'cultivo/registrarInsumo', component: RegisterInsumoCultivoComponent},
                  { path: 'cultivo/estadoCultivo', component: DashboardCultivoComponent},
                  { path: 'cultivo/verCultivo', component: TablaCultivoComponent},
                  { path: 'cultivo/historirialInsumo', component: HistorialInsumoComponent},
                  { path: 'MiPerfil', component: MiPerfilComponent}
              ],
            },
          ]),
          
        provideAnimations(),
        provideHttpClient(),
        importProvidersFrom(MatDialogModule)
    ]
}).catch(err => console.error(err));
