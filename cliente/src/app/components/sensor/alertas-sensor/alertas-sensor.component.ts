import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-alertas-sensor',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
  ],
  templateUrl: './alertas-sensor.component.html',
  styleUrl: './alertas-sensor.component.css'
})
export class AlertasSensorComponent {

  constructor(
    private router: Router,
    private location: Location) {}

    
  goToComponent(path: string) {
    const segments = path.split('/');
    console.log('Navegando a:', segments);
    this.router.navigate(['/dashboard',  ...segments]);
  }

  onExit() {
    this.location.back();
  }
}
