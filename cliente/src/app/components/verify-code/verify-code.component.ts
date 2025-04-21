import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';
import { API_URLS } from '../../../config/api_config';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-verify-code',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent {

  codeForm: FormGroup;
  isLoading = false;
  email: string = ''; // Este se debe pasar desde la vista anterior (por ejemplo vía Navigation Extras)
  code: string[] = new Array(5).fill('');

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private apiService: ApiService
  ) {
    this.codeForm = this.fb.group({
      token: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    // Simulación: recuperar el correo del storage temporal o navigation extras
    const storedEmail = localStorage.getItem('recoveryEmail');
    if (storedEmail) this.email = storedEmail;
  }
  onInputChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
  
    if (!/^\d$/.test(value)) {
      input.value = ''; // Borra el input directamente (sin tocar el array)
      return;
    }
  
    // Enfocar siguiente input automáticamente
    const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
    if (nextInput) {
      nextInput.focus();
    }
  }
  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
  
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }
  
  
  
  
  
  
  
  resendEmail() {
    console.log('Reenviando código...');
  }

  verifyCode() {
    console.log('Botón presionado');
    const token = this.code.join('');

    if (token.length !== 5 || !/^\d{5}$/.test(token)) {
      this.snackBar.open('Código inválido, deben ser 5 dígitos numéricos.', 'Cerrar', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.snackBar.open('Correo inválido o no encontrado. Intenta nuevamente.', 'Cerrar', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      this.router.navigate(['/forgotPassword']);
      return;
    }
  
    this.isLoading = true;
  
    const body = {
      correo: this.email,
      token
    };
  
    console.log('Enviando código:', body); // para debug
  
    this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/usuarios/validartoken`, body)
      .subscribe({
        next: () => {
          // localStorage.removeItem('recoveryEmail'); 
          this.snackBar.open('Código verificado correctamente', 'Cerrar', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
  
          setTimeout(() => this.router.navigate(['/pwdRecovery']), 2000);
        },
        error: () => {
          this.snackBar.open('Código inválido o expirado', 'Cerrar', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.isLoading = false;
        }
      });
  }
}
