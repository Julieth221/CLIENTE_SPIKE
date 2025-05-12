import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotPassComponent } from './components/forgot-pass/forgot-pass.component';
import { RegisterComponent } from './components/register/register.component';
import { RegisterSensorComponent } from './components/register-sensor/register-sensor.component';
import { RegistroTSensorComponent } from './components/registro-t-sensor/registro-t-sensor.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'forgotPassword', component: ForgotPassComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent},
    { path: 'register-sensor', component: RegisterSensorComponent},
    { path: 'registro-t-sensor', component: RegistroTSensorComponent},
];
