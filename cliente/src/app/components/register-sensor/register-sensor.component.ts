import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-register-sensor',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './register-sensor.component.html',
  styleUrl: './register-sensor.component.css'
})
export class RegisterSensorComponent {

}
