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
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms'; // Added Validators
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider'; // Import MatDividerModule

interface Sensor {
  id: number;
  nombre: string;
  tipo: 'ph' | 'humedad' | 'temperatura' | 'luz'; // Added 'luz' for example
  cultivo: string; // Added cultivation property
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
    MatDividerModule, // Add MatDividerModule here
  ],
  templateUrl: './config-alert.component.html',
  styleUrl: './config-alert.component.css'
})
export class ConfigAlertComponent implements OnInit {
  sensoresRegistrados: Sensor[] = [
    { id: 1, nombre: 'Sensor pH Lote A', tipo: 'ph', cultivo: 'Tomate', email: 'usuario1@example.com', telefono: '+573001234567' },
    { id: 2, nombre: 'Sensor Humedad Invernadero 1', tipo: 'humedad', cultivo: 'Lechuga', email: 'usuario2@example.com', telefono: '+573019876543' },
    { id: 3, nombre: 'Sensor Temperatura Exterior', tipo: 'temperatura', cultivo: 'Maíz', email: 'usuario1@example.com', telefono: '+573001122334' },
    { id: 4, nombre: 'Sensor pH Lote B', tipo: 'ph', cultivo: 'Tomate', email: 'usuario3@example.com', telefono: '+573025556666' },
    { id: 5, nombre: 'Sensor Humedad Invernadero 2', tipo: 'humedad', cultivo: 'Fresa', email: 'usuario2@example.com', telefono: '+573012223333' },
    { id: 6, nombre: 'Sensor Temperatura Almacén', tipo: 'temperatura', cultivo: 'Maíz', email: 'usuario3@example.com', telefono: '+573024445555' },
    { id: 7, nombre: 'Sensor Luz Invernadero 3', tipo: 'luz', cultivo: 'Lechuga', email: 'usuario4@example.com', telefono: '+573007778899' },
  ];

  // New properties for cultivation filter
  cultivosOptions: string[] = [];
  selectedCultivo: string | null = null;
  filteredSensorsByCultivo: Sensor[] = [];

  filterSensorType: '' | 'ph' | 'humedad' | 'temperatura' | 'luz' = ''; // Updated type
  filteredSensorsByType: Sensor[] = []; // This will hold sensors filtered by type AND cultivation
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
  alertName: string = ''; // New field for alert name/description
  alertDescription: string = ''; // New field for alert description
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
    // Populate cultivation options
    this.cultivosOptions = [...new Set(this.sensoresRegistrados.map(s => s.cultivo))].sort();

    // Initial filter setup (no cultivation selected yet)
    this.filteredSensorsByCultivo = []; // Initially empty until a cultivation is selected
    this.filteredSensorsByType = []; // Initially empty
    this.updateSensorUnit();

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

  onCultivoChange() {
    this.filterSensorType = ''; // Reset sensor type filter when cultivation changes
    this.selectedSensorId = null;
    this.selectedSensorName = null;
    this.selectedSensorEmail = null;
    this.selectedSensorTelefono = null;
    this.sensorInputControl.setValue(''); // Clear sensor input

    if (this.selectedCultivo) {
      this.filteredSensorsByCultivo = this.sensoresRegistrados.filter(sensor =>
        sensor.cultivo === this.selectedCultivo
      );
    } else {
      this.filteredSensorsByCultivo = [];
    }
    this.onFilterTypeChange(); // Re-apply type filter based on new cultivation
  }

  onFilterTypeChange() {
    // Filter by cultivation first, then by sensor type
    let tempSensors = this.selectedCultivo
      ? this.filteredSensorsByCultivo
      : [...this.sensoresRegistrados]; // If no cultivation, use all sensors

    if (this.filterSensorType) {
      tempSensors = tempSensors.filter(sensor => sensor.tipo === this.filterSensorType);
    }
    this.filteredSensorsByType = tempSensors;

    // Reset selected sensor if it no longer matches the filters
    if (this.selectedSensorId) {
      const currentSelected = this.filteredSensorsByType.find(s => s.id === this.selectedSensorId);
      if (!currentSelected) {
        this.selectedSensorId = null;
        this.selectedSensorName = null;
        this.selectedSensorEmail = null;
        this.selectedSensorTelefono = null;
        this.sensorInputControl.setValue('');
      }
    }
    this.updateSensorUnit();
  }

  private _filter(value: string): Sensor[] {
    const filterValue = value.toLowerCase();
    // Filter from the already filtered list (by cultivation and type)
    return this.filteredSensorsByType.filter(sensor => sensor.nombre.toLowerCase().includes(filterValue));
  }

  onSensorSelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedSensorName = event.option.value;
    const selectedSensor = this.sensoresRegistrados.find(sensor => sensor.nombre === this.selectedSensorName);
    this.selectedSensorId = selectedSensor?.id || null;
    this.selectedSensorEmail = selectedSensor?.email || null;
    this.selectedSensorTelefono = selectedSensor?.telefono || null;
    this.updateSensorUnit();
    this.sensorInputControl.setValue(this.selectedSensorName); // Keep the selected name in the input
  }

  onSensorIdSelected(): void {
    const selectedSensor = this.sensoresRegistrados.find(sensor => sensor.id === this.selectedSensorId);
    this.selectedSensorName = selectedSensor?.nombre || null;
    this.selectedSensorEmail = selectedSensor?.email || null;
    this.selectedSensorTelefono = selectedSensor?.telefono || null;
    this.updateSensorUnit();
    this.sensorInputControl.setValue(this.selectedSensorName); // Update autocomplete input with selected name
  }

  updateSensorUnit() {
    // Determine unit based on the selected sensor's type
    const sensorType = this.selectedSensorId
      ? this.sensoresRegistrados.find(s => s.id === this.selectedSensorId)?.tipo
      : this.filterSensorType; // Fallback to filter type if no specific sensor selected

    if (sensorType === 'ph') {
      this.selectedSensorUnit = 'pH';
    } else if (sensorType === 'humedad') {
      this.selectedSensorUnit = '%';
    } else if (sensorType === 'temperatura') {
      this.selectedSensorUnit = '°C';
    } else if (sensorType === 'luz') {
      this.selectedSensorUnit = 'lux'; // Example unit for light sensor
    } else {
      this.selectedSensorUnit = '';
    }
  }

  isFormValid(): boolean {
    // Ensure an alert name/description is provided
    if (!this.alertName.trim()) {
      return false;
    }

    // Ensure a sensor is selected (either by ID or if a type filter is applied and there are sensors)
    if (!this.selectedSensorId && (!this.selectedCultivo || this.filteredSensorsByType.length === 0)) {
        return false;
    }

    // Validate thresholds based on alert type
    if (this.alertType === 'alto' && this.highThreshold === null) {
      return false;
    }
    if (this.alertType === 'bajo' && this.lowThreshold === null) {
      return false;
    }
    if (this.alertType === 'rango' && (this.rangeMin === null || this.rangeMax === null || this.rangeMin >= this.rangeMax)) {
      return false;
    }

    // Ensure at least one notification method is selected
    if (!this.notifyApp && !this.notifyEmail && !this.notifySMS) {
      return false;
    }

    return true;
  }

  saveAlert() {
    if (this.isFormValid()) {
      const selectedSensor = this.selectedSensorId
        ? this.sensoresRegistrados.find(sensor => sensor.id === this.selectedSensorId)
        : null; // If no specific sensor, it means a type/cultivation filter was applied

      const alertConfig = {
        alertName: this.alertName.trim(), // Include alert name
        sensor: selectedSensor ? { id: selectedSensor.id, nombre: selectedSensor.nombre, tipo: selectedSensor.tipo, cultivo: selectedSensor.cultivo } : null,
        // If no specific sensor is selected but filters are applied, capture the filter criteria
        filterCriteria: !selectedSensor && (this.selectedCultivo || this.filterSensorType) ? {
          cultivo: this.selectedCultivo,
          tipoSensor: this.filterSensorType
        } : null,
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
        emailDestino: selectedSensor?.email,
        telefonoDestino: selectedSensor?.telefono,
      };
      console.log('Alerta configurada:', alertConfig);

      // Display success message
      let message = 'Alerta configurada exitosamente.';
      if (this.alertName) {
        message += ` Nombre: "${this.alertName}"`;
      }
      if (selectedSensor?.nombre) {
        message += ` para el sensor: "${selectedSensor.nombre}"`;
      } else if (alertConfig.filterCriteria) {
        message += ` para sensores con filtros: ${alertConfig.filterCriteria.cultivo ? 'Cultivo: ' + alertConfig.filterCriteria.cultivo : ''} ${alertConfig.filterCriteria.tipoSensor ? 'Tipo: ' + alertConfig.filterCriteria.tipoSensor : ''}`;
      }

      this.snackBar.open(message, 'Cerrar', {
        duration: 5000,
        panelClass: ['success-snackbar'],
      });

    } else {
      this.snackBar.open(
        'Por favor, completa todos los campos requeridos para guardar la alerta.',
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
      console.log('Formulario inválido. Por favor, completa los campos requeridos.');
    }
  }
}
