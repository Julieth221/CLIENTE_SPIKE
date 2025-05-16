import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Location } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

interface Sensor {
  id: number;
  nombre: string;
  tipo: 'ph' | 'humedad' | 'temperatura';
  email?: string;
  telefono?: string;
}

@Component({
  selector: 'app-config-alert',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSnackBarModule,
  ],
  templateUrl: './config-alert.component.html',
  styleUrl: './config-alert.component.css'
})
export class ConfigAlertComponent implements OnInit {
  sensoresRegistrados: Sensor[] = [
    { id: 1, nombre: 'Sensor pH Lote A', tipo: 'ph', email: 'usuario1@example.com', telefono: '+573001234567' },
    { id: 2, nombre: 'Sensor Humedad Invernadero 1', tipo: 'humedad', email: 'usuario2@example.com', telefono: '+573019876543' },
    { id: 3, nombre: 'Sensor Temperatura Exterior', tipo: 'temperatura', email: 'usuario1@example.com', telefono: '+573001122334' },
    { id: 4, nombre: 'Sensor pH Lote B', tipo: 'ph', email: 'usuario3@example.com', telefono: '+573025556666' },
    { id: 5, nombre: 'Sensor Humedad Invernadero 2', tipo: 'humedad', email: 'usuario2@example.com', telefono: '+573012223333' },
    { id: 6, nombre: 'Sensor Temperatura Almacén', tipo: 'temperatura', email: 'usuario3@example.com', telefono: '+573024445555' },
  ];

  filterSensorType: '' | 'ph' | 'humedad' | 'temperatura' = '';
  filteredSensorsByType: Sensor[] = [...this.sensoresRegistrados];
  sensorInputControl = new FormControl('');
  filteredSensors: Observable<Sensor[]>;
  selectedSensorId: number | null = null;
  selectedSensorName: string | null = null;
  selectedSensorEmail: string | null = null;
  selectedSensorTelefono: string | null = null;
  alertType: 'alto' | 'bajo' | 'rango' = 'alto';
  highThreshold: number | null = null;
  lowThreshold: number | null = null;
  rangeMin: number | null = null;
  rangeMax: number | null = null;
  verificationFrequency: number = 60;
  notifyApp: boolean = false;
  notifyEmail: boolean = false;
  notifySMS: boolean = false;
  alertEnabled: boolean = false;
  alertName: string = '';
  selectedSensorUnit: string = '';

  constructor(
    private location: Location,
    private snackBar: MatSnackBar
  ) {
    this.filteredSensors = this.sensorInputControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      const container = document.querySelector('.config-alt-container');
      if (container) {
        container.classList.add('loaded');
      }
    }, 50);
  }

  onExit() {
    this.location.back();
  }

  onFilterTypeChange() {
    this.filteredSensorsByType = this.filterSensorsByType();
    this.sensorInputControl.setValue('');
    this.selectedSensorId = null;
    this.selectedSensorName = null;
    this.selectedSensorEmail = null;
    this.selectedSensorTelefono = null;
    this.updateSensorUnit();
  }

  private filterSensorsByType(): Sensor[] {
    if (!this.filterSensorType) {
      return [...this.sensoresRegistrados];
    }
    return this.sensoresRegistrados.filter(sensor => sensor.tipo === this.filterSensorType);
  }

  private _filter(value: string): Sensor[] {
    const filterValue = value.toLowerCase();
    return this.filteredSensorsByType.filter(sensor => sensor.nombre.toLowerCase().includes(filterValue));
  }

  onSensorSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedSensorName = event.option.value;
    const selectedSensor = this.sensoresRegistrados.find(sensor => sensor.nombre === this.selectedSensorName);
    this.selectedSensorId = selectedSensor?.id || null;
    this.selectedSensorEmail = selectedSensor?.email || null;
    this.selectedSensorTelefono = selectedSensor?.telefono || null;
    this.updateSensorUnit();
    this.sensorInputControl.setValue('');
  }

  onSensorIdSelected(): void {
    const selectedSensor = this.sensoresRegistrados.find(sensor => sensor.id === this.selectedSensorId);
    this.selectedSensorName = selectedSensor?.nombre || null;
    this.selectedSensorEmail = selectedSensor?.email || null;
    this.selectedSensorTelefono = selectedSensor?.telefono || null;
    this.updateSensorUnit();
  }

  updateSensorUnit() {
    if (this.selectedSensorName && this.selectedSensorName.includes('pH')) {
      this.selectedSensorUnit = 'pH';
    } else if (this.selectedSensorName && this.selectedSensorName.includes('Humedad')) {
      this.selectedSensorUnit = '%';
    } else if (this.selectedSensorName && this.selectedSensorName.includes('Temperatura')) {
      this.selectedSensorUnit = '°C';
    } else {
      this.selectedSensorUnit = '';
    }
  }

  isFormValid(): boolean {
    if (!this.selectedSensorId && !this.filterSensorType) {
      return false;
    }

    if (this.alertType === 'alto' && this.highThreshold === null) {
      return false;
    }
    if (this.alertType === 'bajo' && this.lowThreshold === null) {
      return false;
    }
    if (this.alertType === 'rango' && (this.rangeMin === null || this.rangeMax === null || this.rangeMin >= this.rangeMax)) {
      return false;
    }

    return true;
  }

saveAlert() {
  if (this.isFormValid()) {
    const selectedSensor = this.selectedSensorId
      ? this.sensoresRegistrados.find(sensor => sensor.id === this.selectedSensorId) ??  // Use nullish coalescing
        { id: null, nombre: null, tipo: this.filterSensorType } // Provide a *safe* default
      : { id: null, nombre: this.selectedSensorName, tipo: this.filterSensorType };

    // selectedSensor is now guaranteed to be an object, so no 'undefined' issue
    const alertConfig = {
      sensor: selectedSensor,
      type: this.alertType,
      highThreshold: this.highThreshold,
      lowThreshold: this.lowThreshold,
      rangeMin: this.rangeMin,
      rangeMax: this.rangeMax,
      frequency: this.verificationFrequency,
      notifyApp: this.notifyApp,
      notifyEmail: this.notifyEmail,
      notifySMS: this.notifySMS,
      enabled: this.alertEnabled,
      name: this.alertName,
      emailDestino: this.selectedSensorEmail,
      telefonoDestino: this.selectedSensorTelefono,
    };
    console.log('Alerta configurada:', alertConfig);

    if (this.notifyApp) {
      this.snackBar.open(
        'Alerta configurada para ' + (selectedSensor.nombre || 'el sensor seleccionado') + '.',  // improve user message
        'Cerrar',
        {
          duration: 3000,
        }
      );
    }
  } else {
    this.snackBar.open(
      'Por favor, completa los campos requeridos para guardar la alerta.',
      'Cerrar',
      {
        duration: 3000,
        panelClass: ['error-snackbar'],
      }
    );
    console.log('Formulario inválido. Por favor, completa los campos requeridos.');
  }
}
}