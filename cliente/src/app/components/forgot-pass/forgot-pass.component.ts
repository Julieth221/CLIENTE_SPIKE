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
import { ApiService } from '../../../services/api.service';
import { API_URLS } from '../../../config/api_config';

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

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private router: Router, private apiService: ApiService) {
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
  
    const correo = this.forgotPasswordForm.value.email;
  
    const correoData = {
      CorreoElectronico: correo
    };
  
    this.apiService.put(`${API_URLS.MID.API_MID_SPIKE}/usuarios/${correo}`, correoData)
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta de forgot password', response);
          this.snackBar.open('El código de recuperación fue enviado', 'Cerrar', {
            duration: 4000
          });
           // Guardar el correo antes de ir a la siguiente vista
          localStorage.setItem('recoveryEmail', correo);
          this.isLoading = false;
          this.router.navigate(['/verifyCode']);
        },
        error: (error) => {
          console.error('Error al enviar el código');
          this.isLoading = false;
  
          if (error.error && error.error.mensaje) {
            this.snackBar.open('Error al enviar el código de recuperación', 'Cerrar', {
              duration: 4000
            });
          }
        }
      });
  }
  
}