import { Component,  Signal, computed, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'


@Component({
  selector: 'app-finca-register',
  imports: [
    MatCardModule,
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule, 
    FormsModule
  ],
  templateUrl: './finca-register.component.html',
  styleUrl: './finca-register.component.css'
})
export class FincaRegisterComponent {
   // Base form fields
   nombre = signal('');
   areaTotal = signal<number | null>(null);
   cantidadParcelas = signal<number | null>(null);
   tamanoTotalParcelas = signal<number | null>(null);
   tipoSuelo = signal('');
 
   // List of options
   tipoSueloOptions = ['Franco Arenoso', 'Arcilloso', 'Limoso', 'Franco Arcilloso'];
   cantidadParcelasOptions = Array.from({ length: 10 }, (_, i) => i + 1);
 
   // Dynamic parcelas
   parcelas = computed(() => {
     const cantidad = this.cantidadParcelas();
     return Array.from({ length: cantidad || 0 }, (_, i) => ({
       numero: i + 1,
       tamanio: '',
       ubicacion: ''
     }));
   });
 
   // Guardar lógica (dummy)
   guardarFinca() {
     console.log('Datos Finca:', {
       nombre: this.nombre(),
       areaTotal: this.areaTotal(),
       cantidadParcelas: this.cantidadParcelas(),
       tamanioTotalParcelas: this.tamanoTotalParcelas(),
       tipoSuelo: this.tipoSuelo(),
       parcelas: this.parcelas()
     });
     // Aquí podrías hacer una petición HTTP POST a tu API
   }

}
