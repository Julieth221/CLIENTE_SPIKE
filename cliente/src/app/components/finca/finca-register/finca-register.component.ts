import { Component,  EventEmitter, Output, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../../services/api.service';
import { API_URLS } from '../../../../config/api_config';
import { MapComponent } from '../map/map.component';


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
    FormsModule,
    MapComponent
    

  ],
  templateUrl: './finca-register.component.html',
  styleUrl: './finca-register.component.css',
  
})
export class FincaRegisterComponent {
  @ViewChild(MapComponent) mapComponent!: MapComponent; // Referencia al componente del mapa
  center = { lat: 4.570868, lng: -74.297333 }; // Ubicación por defecto (Colombia)

  fincaForm: FormGroup;
  tipoSueloOptions = ['Franco Arenoso', 'arcilloso', 'Limoso', 'Franco Arcilloso'];
  cantidadParcelasOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.fincaForm = this.fb.group({
      nombre: ['', Validators.required],
      areaTotal: [null, [Validators.required, Validators.min(1)]],
      cantidadParcelas: [null, Validators.required],
      tamanoTotalParcelas: [null, [Validators.required, Validators.min(1)]],
      tipoSuelo: ['', Validators.required],
      parcelas: this.fb.array([])
    });

    this.fincaForm.get('cantidadParcelas')?.valueChanges.subscribe(cantidad => {
      this.Parcelas(cantidad);
    });
  }


 
  get parcelasFormArray(): FormArray {
    return this.fincaForm.get('parcelas') as FormArray;
  }

  Parcelas(cantidad: number) {
    const parcelas = this.parcelasFormArray;
    parcelas.clear(); // Limpiar primero

    for (let i = 0; i < cantidad; i++) {
      parcelas.push(this.fb.group({
        tamanio: ['', Validators.required],
        ubicacion: ['', Validators.required]
      }));
    }
  }
 
   // Guardar lógica (dummy)
   guardarFinca() {
    console.log('se presiono el boton registrar finca')
    if (this.fincaForm.invalid) {
      this.fincaForm.markAllAsTouched();
      return;
    }
  
    const formValue = this.fincaForm.value;
    const fincaData = {
      Nombre: formValue.nombre,
      AreaTotal: formValue.areaTotal,
      TotalParcelas: formValue.cantidadParcelas,
      TamanoParcelas: formValue.tamanoTotalParcelas,
      tipo_suelo: formValue.tipoSuelo,
      parcelas: formValue.parcelas.map((p: any, index: number) => {
        let geo = {
          LatitudInicial: '',
          LongitudInicial: '',
          LatitudFinal: '',
          LongitudFinal: ''
        };
  
        if (p.ubicacion) {
          if (p.ubicacion) {
            geo = {
              LatitudInicial: p.ubicacion.LatitudInicial || '',
              LongitudInicial: p.ubicacion.LongitudInicial || '',
              LatitudFinal: p.ubicacion.LatitudFinal || '',
              LongitudFinal: p.ubicacion.LongitudFinal || ''
            };
          }
        }
  
        return {
          NombreParcela: `Parcela ${index + 1}`,
          TamanoParcela: formValue.tamanoTotalParcelas,
          geolocalizacion: geo
        };
      })
    };
  
    this.apiService.post(`${API_URLS.MID.API_MID_SPIKE}/finca`, fincaData).subscribe({
      next: (response) => {
        console.log('Finca registrada con éxito:', response);
      },
      error: (error) => {
        console.error('Error al registrar finca:', error);
      }
    });
  }
  // Maneja la actualización de la geolocalización recibida del mapa
  onGeolocalizacionChange(geolocalizacion: any, index: number) {
    const parcela = this.parcelasFormArray.at(index);
    parcela.get('ubicacion')?.setValue(geolocalizacion);
  }
  
   
  
}

