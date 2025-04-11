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
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ApiService } from '../../../services/api.service';
import { API_URLS } from '../../../config/api_config';


@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule, 
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      rol: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.checkPasswords });
  }

  checkPasswords(group: FormGroup) {
    // const password = group.get('password')?.value;
    // const confirmPassword = group.get('confirmPassword')?.value;
    // return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    const formValue = this.registerForm.value;

    const body = {
      Nombre: formValue.nombre,
      Apellido: formValue.apellido,
      Contacto: formValue.telefono,
      CorreoElectronico: formValue.email,
      contraseña: formValue.password,
      Rol: formValue.rol
    };
    console.log('Enviando código:', body);

    this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/usuarios/`, body).subscribe({
      next: (response) => {
        // console.log("Usuario registrado correctamente:", response);
        alert('usuario registrado exitosamente')
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error("Error al registrar:", error);
        alert('Error al registrarse')
      }
    });
  }
  

  goToLogin(){
    this.router.navigate(['/login'])
  }

}


