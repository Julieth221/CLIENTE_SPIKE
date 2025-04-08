import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule} from '@angular/material/input';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-pass',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './forgot-pass.component.html',
  styleUrl: './forgot-pass.component.css'
})
export class ForgotPassComponent { forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private router: Router) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(field: string): string {
    if (this.forgotPasswordForm.get(field)?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (this.forgotPasswordForm.get(field)?.hasError('email')) {
      return 'Ingrese un correo válido';
    }
    return '';
  }

  sendResetCode() {
    if (this.forgotPasswordForm.invalid) return;

    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Se ha enviado el enlace de recuperación a su correo', 'Cerrar', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });

    // Esperar a que el mensaje termine para navegar
    setTimeout(() => {
      this.router.navigate(['/verifyCode']); 
    }, 3000); 
  }, 2000);
  }
}