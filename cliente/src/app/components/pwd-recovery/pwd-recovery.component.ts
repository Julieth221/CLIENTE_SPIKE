import { Component, OnInit  } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ErrorModalComponent } from '../error-modal/error-modal.component';

@Component({
  selector: 'app-pwd-recovery',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule, 
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './pwd-recovery.component.html',
  styleUrl: './pwd-recovery.component.css'
})
export class PwdRecoveryComponent implements OnInit {
  pwdRecoveryForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false; 

  constructor(private fb: FormBuilder, private router: Router, private dialog: MatDialog) {
    this.pwdRecoveryForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator() }
    );
  }

  ngOnInit(): void {}


  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }

  resetPassword(): void {
    if (this.pwdRecoveryForm.valid) {
      this.isLoading = true; 
      // setTimeout(() => {  // Simulación de una petición HTTP exitosa
      //   console.log('Contraseña restablecida exitosamente');
      //   this.isLoading = false; 
      //   this.router.navigate(['/pwdSuccess']); 
      // }, 2000); 

      setTimeout(() => {
        this.isLoading = false;
  
        // Simular un error
        const hasError = true;
        if (hasError) {
          this.dialog.open(ErrorModalComponent, {
            width: '300px',
            disableClose: true,
          });
        }
      }, 2000);
    }
  }
}
