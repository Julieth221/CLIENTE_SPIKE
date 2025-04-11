import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../services/api.service';
import { API_URLS } from '../../../config/api_config';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    
    if (!control) return '';
    
    if (field === 'email') {
      if (control.hasError('required')) return 'El correo es requerido';
      if (control.hasError('email')) return 'Ingrese un correo válido';
    }
    
    if (field === 'password') {
      if (control.hasError('required')) return 'La contraseña es requerida';
      if (control.hasError('minlength')) return 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return '';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  login() {
    if (this.loginForm.invalid) return;
  
    this.isLoading = true;
    this.loginError = '';
  
    const loginData = {
      CorreoElectronico: this.loginForm.value.email,
      contraseña: this.loginForm.value.password
    };
  
    this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/usuarios/sistem/login`, loginData)
      .subscribe({
        next: (response: any) => {
          // console.log('Respuesta del login:', response);
          this.isLoading = false;
  
          if (response && response.token) {
            // Guardar token en localStorage o donde lo necesites
            localStorage.setItem('authToken', response.token);
  
            // Redirigir al dashboard
            this.router.navigate(['/dashboard']);
          } else {
            this.loginError = 'Correo y/o contraseña incorrectos.';
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.isLoading = false;
  
          if (error.error && error.error.mensaje) {
            this.loginError = error.error.mensaje;
          } else {
            this.loginError = 'Error al intentar iniciar sesión.';
          }
        }
      });
  }
  

  goToForgotPass(){
    console.log('Olvidé mi contraseña')
    this.router.navigate(['/forgotPassword'])
  }

  goToRegister(){
    console.log('Registrarme')
    this.router.navigate(['/register'])

  }





}
