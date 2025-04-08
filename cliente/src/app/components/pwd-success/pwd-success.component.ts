import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pwd-success',
  imports: [
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './pwd-success.component.html',
  styleUrl: './pwd-success.component.css'
})
export class PwdSuccessComponent {

  constructor (private router: Router){}

  goToLogin(){
    this.router.navigate(['/login'])
  }


}
