import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Router } from '@angular/router';  // Importa el Router

// Define custom date formats
const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-registro-t-sensor',
    standalone: true,
    imports: [
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
    ],
    templateUrl: './registro-t-sensor.component.html',
    styleUrl: './registro-t-sensor.component.css',
    providers: [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ]
})
export class RegistroTSensorComponent implements OnInit {
    sensorForm: FormGroup;
    ubicacion: string = '';
    latitud: number | null = null;
    longitud: number | null = null;
    cultivos: string[] = []; // Array para los nombres de los cultivos
    cultivoSeleccionado: string = '';

    constructor(private fb: FormBuilder, private router: Router) {  // Inyecta el Router
        this.sensorForm = this.fb.group({
            nombre: ['', Validators.required],
            ubicacion: ['', Validators.required],
            cultivo: ['', Validators.required], // Cambiado a 'cultivo'
            fecha: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        // Inicializa la lista de cultivos (simulación de la base de datos)
        this.cultivos = ['Blanco', 'Azul', 'Cualquiera', 'Amarillo'];
    }

    // Función para obtener la geolocalización
    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitud = position.coords.latitude;
                this.longitud = position.coords.longitude;
                this.sensorForm.patchValue({
                    ubicacion: `Lat: ${this.latitud}, Long: ${this.longitud}`,
                });
            }, (error) => {
                console.error('Error al obtener la ubicación:', error);
                alert('No se pudo obtener la ubicación. Por favor, asegúrate de que la geolocalización esté habilitada en tu navegador.');
            });
        } else {
            alert('Geolocalización no soportada por el navegador.');
        }
    }

    onSubmit() {
        if (this.sensorForm.valid) {
            console.log('Formulario del sensor:', this.sensorForm.value);
            // Aquí puedes enviar los datos del formulario a tu backend

            // Redirige a otro componente después de un registro exitoso
            this.router.navigate(['/dashboard']); // Ajusta la ruta según tu necesidad

        } else {
            alert('Por favor, completa todos los campos del formulario.');
        }
    }

    onCultivoChange(event: any) {
        this.cultivoSeleccionado = event.value;
        this.sensorForm.get('cultivo')?.setValue(event.value);
    }
}
