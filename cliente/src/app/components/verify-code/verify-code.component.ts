import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-verify-code',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent {

  email: string = 'sarah.jansen@gmail.com';
  code: string[] = new Array(5).fill('');

  constructor (private router: Router){}

  focusNextInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  resendEmail() {
    console.log('Reenviando código...');
  }

  verifyCode() {
    // console.log('Código ingresado:', this.code.join(''));
    this.router.navigate(['/pwdRecovery'])
  }

}
