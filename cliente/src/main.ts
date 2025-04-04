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

bootstrapApplication(AppComponent,{
    providers:[
        provideRouter([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'login', component: LoginComponent },
            { path: 'forgotPassword', component: ForgotPassComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'dashboard', component: DashboardComponent}
          ]),
        provideAnimations(),
        provideHttpClient()
    ]
}).catch(err => console.error(err));
