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
                path: 'dashboard',
                component: DashboardComponent,
                children: [
                  { path: 'finca/registrar', loadComponent: () => import('./app/components/finca/finca-register/finca-register.component').then(m => m.FincaRegisterComponent) },
                ],
              },
          ]),
        provideAnimations(),
        provideHttpClient(),
        importProvidersFrom(MatDialogModule)
    ]
}).catch(err => console.error(err));