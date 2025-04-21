import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-error-modal',
  imports: [
    MatDialogModule
  ],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.css'
})
export class ErrorModalComponent {
  


  constructor(private router:Router, private dialog: MatDialogRef<ErrorModalComponent>) { 
    setTimeout(() => {
      this.dialog.close();
      this.router.navigate(['/home']); 
    }, 5000);
  }
}


