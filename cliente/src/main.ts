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
// import { RegisterSensorComponent } from './app/components/register-sensor/register-sensor.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FincaRegisterComponent } from './app/components/finca/finca-register/finca-register.component';
// import { RegistroTSensorComponent } from './app/components/registro-t-sensor/registro-t-sensor.component';
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
                  { path: 'sensor/gestion-sensores', component: GestionSensoresComponent },
                  { path: 'finca/verArrendamiento', component: VerArrendamientosComponent},
                  { path: 'sensor/alertas-sensor', component: AlertasSensorComponent},
                  { path: 'sensor/localizar-sensor', component: LocalizarSensorComponent},
                  { path: 'sensor/probar-sensor', component: ProbarSensorComponent},
              ],
            },

          ]),
          
        provideAnimations(),
        provideHttpClient(),
        importProvidersFrom(MatDialogModule)
    ]
}).catch(err => console.error(err));
