import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-register-sensor',
    standalone: true,
    imports: [
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        RouterModule,
    ],
    templateUrl: './register-sensor.component.html',
    styleUrl: './register-sensor.component.css'
})
export class RegisterSensorComponent {

    constructor(private router: Router) { }

    // Ir a un componente usando rutas dinámicas
    goToComponent(path: string) {
        const segments = path.split('/');
        console.log('Navegando a:', segments);
        this.router.navigate(['/dashboard',  ...segments]);
    }
}