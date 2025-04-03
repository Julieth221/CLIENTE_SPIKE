import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent,{
  providers:[
    provideRouter([
      { path: '', component: DashboardComponent },
    ]),
    provideHttpClient()
  ]
})
.catch(err => console.error(err));
