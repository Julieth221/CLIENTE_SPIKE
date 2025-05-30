import { Component, Inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle'; // Se mantiene por si se quiere reintroducir en el futuro, aunque no se usa directamente ahora
import { FormsModule } from '@angular/forms';

// Interfaz para la alerta (referencia)
interface Alerta {
  Id: number;
  Nombre: string; // Nombre del sensor
  TipoSensor: 'PH' | 'Humedad' | 'Temperatura' | 'Luz'; // Tipos de sensor específicos
  Cultivo: string;
  // ... otras propiedades de la alerta si son necesarias para mostrar
}

// Interfaz para el historial de alertas (basada en tu modelo Go)
interface AlertasHistorial {
  Id: number;
  IdAlerta: Alerta;
  FechaAlerta: string; // Usamos string para simplificar con datos quemados
  Activo: boolean;
  Estado: boolean; // true: resuelta, false: pendiente/activa
  Descripcion: string;
  FechaCreacion: string;
  FechaModificacion: string;
  sensorReadings?: { timestamp: string, value: number }[]; // Datos de lectura del sensor
}

@Component({
  selector: 'app-ver-historial-alert',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatButtonToggleModule,
    FormsModule
  ],
  providers: [DatePipe],
  templateUrl: './ver-historial-alert.component.html',
  styleUrl: './ver-historial-alert.component.css'
})
export class VerHistorialAlertComponent implements OnInit, AfterViewInit {
  // Referencia al elemento canvas en el HTML para dibujar el gráfico
  @ViewChild('sensorChartCanvas') sensorChartCanvas!: ElementRef<HTMLCanvasElement>;

  // No se usa 'selectedChartType' directamente para la selección de tipo, pero se mantiene por si se necesita para lógica interna.
  // Ahora solo hay un tipo de gráfico: la línea de tiempo infográfica.
  selectedChartType: 'line' | 'bar' | 'histogram' | 'pie' = 'line'; // Valor por defecto, pero el gráfico siempre será una línea de tiempo.

  // Constructor del componente
  constructor(
    // Inyecta MatDialogRef para controlar el diálogo (cerrar, etc.)
    public dialogRef: MatDialogRef<VerHistorialAlertComponent>,
    // Inyecta los datos pasados al diálogo (la alerta histórica)
    @Inject(MAT_DIALOG_DATA) public data: AlertasHistorial
  ) { }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    console.log('Datos de la alerta histórica en el diálogo:', this.data);
  }

  // Método que se ejecuta después de que la vista del componente ha sido inicializada
  ngAfterViewInit(): void {
    // Dibuja el gráfico solo si hay datos de lectura del sensor
    if (this.data.sensorReadings && this.data.sensorReadings.length > 0) {
      this.drawTimelineChart(); // Llama a la nueva función de dibujo de la línea de tiempo
    }
  }

  // Cierra el diálogo
  onClose(): void {
    this.dialogRef.close();
  }

  // Devuelve el color de fondo para el estado de la alerta
  getStatusColor(estado: boolean): string {
    return estado ? '#4CAF50' : '#FFC107'; // Verde para resuelta, Amarillo para pendiente
  }

  // Devuelve el texto descriptivo para el estado de la alerta
  getStatusText(estado: boolean): string {
    return estado ? 'Resuelta' : 'Pendiente';
  }

  // Devuelve el nombre del icono de Material Design según el tipo de sensor (usado en el HTML, no en canvas)
  getSensorTypeIcon(tipo: string): string {
    switch (tipo) {
      case 'PH': return 'science';
      case 'Humedad': return 'water_damage';
      case 'Temperatura': return 'thermostat';
      case 'Luz': return 'light_mode';
      default: return 'sensors';
    }
  }

  // Devuelve el emoji representativo para el tipo de sensor (usado en canvas)
  getSensorTypeEmoji(tipo: string): string {
    switch (tipo) {
      case 'PH': return '🧪'; // Tubo de ensayo
      case 'Humedad': return '💧'; // Gota de agua
      case 'Temperatura': return '🌡️'; // Termómetro
      case 'Luz': return '💡'; // Bombilla
      default: return '⚙️'; // Engranaje (genérico)
    }
  }

  // Devuelve la unidad de medida para el tipo de sensor
  getSensorUnit(tipo: string): string {
    switch (tipo) {
      case 'PH': return 'pH';
      case 'Humedad': return '%';
      case 'Temperatura': return '°C';
      case 'Luz': return 'lux';
      default: return '';
    }
  }

  // Este método ya no se usa para cambiar entre tipos de gráficos,
  // pero podría usarse para otras lógicas de actualización si se reintroducen opciones.
  onChartTypeChange(type: 'line' | 'bar' | 'histogram' | 'pie'): void {
    this.selectedChartType = type; // Actualiza el tipo seleccionado (aunque no se use para alternar vistas)
    this.drawTimelineChart(); // Siempre redibuja la línea de tiempo
  }

  // Dibuja la línea de tiempo infográfica con indicadores de alerta
  drawTimelineChart(): void {
    const canvas: HTMLCanvasElement = this.sensorChartCanvas.nativeElement;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

    // Verifica si el contexto del canvas o los datos de lectura no están disponibles
    if (!ctx || !this.data.sensorReadings || this.data.sensorReadings.length === 0) {
      console.warn('No se pudo obtener el contexto del canvas o no hay datos de lectura para el gráfico.');
      ctx?.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas si no se puede dibujar
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas antes de dibujar

    // Establece las dimensiones del canvas basadas en su tamaño renderizado para el contexto de dibujo
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const padding = 40; // Espaciado alrededor del gráfico para márgenes
    const timelineY = canvas.height / 2; // Posición Y de la línea de tiempo central
    const chartWidth = canvas.width - 2 * padding; // Ancho del área de dibujo disponible

    // Extrae los timestamps de las lecturas del sensor y los convierte a milisegundos
    const timestamps = this.data.sensorReadings.map(r => new Date(r.timestamp).getTime());

    // Calcula el tiempo mínimo y máximo de las lecturas para establecer la escala de la línea de tiempo
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const timeRange = (maxTime - minTime) || 1; // Rango de tiempo total (evita división por cero si solo hay un punto)

    // Dibuja la línea de tiempo principal (el "eje" horizontal)
    ctx.strokeStyle = '#ccc'; // Color gris claro para la línea
    ctx.lineWidth = 2; // Grosor de la línea
    ctx.beginPath();
    ctx.moveTo(padding, timelineY); // Inicia en el borde izquierdo con padding
    ctx.lineTo(canvas.width - padding, timelineY); // Dibuja hasta el borde derecho con padding
    ctx.stroke();

    // Dibuja las etiquetas de tiempo a lo largo de la línea de tiempo
    ctx.fillStyle = '#666'; // Color de texto para las etiquetas
    ctx.font = '10px Arial'; // Fuente y tamaño para las etiquetas
    ctx.textAlign = 'center'; // Alineación central del texto

    // Calcula y dibuja un número fijo de etiquetas de tiempo para dar contexto cronológico
    const numLabels = 5; // Por ejemplo, 5 etiquetas (inicio, 3 intermedias, fin)
    for (let i = 0; i < numLabels; i++) {
      const timeRatio = i / (numLabels - 1); // Proporción de la posición en el tiempo (0 a 1)
      const timeAtPoint = minTime + timeRatio * timeRange; // Tiempo real en ese punto
      const x = padding + timeRatio * chartWidth; // Posición X en el canvas

      const date = new Date(timeAtPoint);
      // Muestra la hora y minuto, y la fecha (día/mes) debajo
      ctx.fillText(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), x, timelineY + 20);
      ctx.fillText(date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }), x, timelineY + 35);
    }

    // Dibuja los eventos de lectura del sensor como pequeños puntos en la línea de tiempo
    this.data.sensorReadings.forEach(reading => {
      // Calcula la posición X de cada lectura en la línea de tiempo
      const x = padding + ((new Date(reading.timestamp).getTime() - minTime) / timeRange) * chartWidth;

      // Dibuja un pequeño círculo para cada lectura del sensor
      ctx.fillStyle = '#2196F3'; // Color azul para las lecturas normales
      ctx.beginPath();
      ctx.arc(x, timelineY, 4, 0, Math.PI * 2); // Círculo de 4px de radio
      ctx.fill();

      // Dibuja el valor numérico de la lectura encima del punto
      ctx.fillStyle = '#333'; // Color de texto oscuro
      ctx.font = '10px Arial'; // Fuente y tamaño para el valor
      ctx.fillText(`${reading.value.toFixed(1)}${this.getSensorUnit(this.data.IdAlerta.TipoSensor)}`, x, timelineY - 15);
    });


    // Resalta el punto específico de la alerta con un icono y círculo de estado
    const alertTime = new Date(this.data.FechaAlerta).getTime(); // Tiempo exacto de la alerta
    // Busca la lectura del sensor que coincide con el tiempo de la alerta
    const alertReading = this.data.sensorReadings.find(r => new Date(r.timestamp).getTime() === alertTime);

    if (alertReading) {
      // Calcula la posición X del punto de alerta en la línea de tiempo
      const alertX = padding + ((alertTime - minTime) / timeRange) * chartWidth;
      const alertYOffset = -40; // Desplazamiento vertical para posicionar el icono de alerta por encima de la línea

      // Dibuja el círculo de estado de la alerta (indicador visual principal)
      ctx.fillStyle = this.data.Estado ? '#4CAF50' : '#FF0000'; // Verde si resuelta, Rojo si pendiente
      ctx.beginPath();
      ctx.arc(alertX, timelineY + alertYOffset, 12, 0, Math.PI * 2); // Círculo más grande para el estado
      ctx.fill();

      // Dibuja el emoji del tipo de sensor dentro del círculo de estado
      ctx.fillStyle = 'white'; // Color blanco para el emoji
      ctx.font = '16px Arial'; // Tamaño del emoji
      ctx.fillText(this.getSensorTypeEmoji(this.data.IdAlerta.TipoSensor), alertX, timelineY + alertYOffset + 6); // Centra el emoji

      // Si la alerta está pendiente, dibuja una línea discontinua y etiqueta el valor de la alerta
      if (!this.data.Estado) {
        ctx.beginPath();
        ctx.strokeStyle = '#FF0000'; // Línea roja para alerta pendiente
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]); // Establece un patrón de línea discontinua (5px de línea, 3px de espacio)

        ctx.moveTo(alertX, timelineY + alertYOffset + 12); // Inicia la línea desde el borde inferior del círculo de alerta
        ctx.lineTo(alertX, timelineY + 5); // Dibuja la línea vertical hacia la línea de tiempo
        ctx.stroke();
        ctx.setLineDash([]); // Restaura el patrón de línea a sólido para futuros dibujos

        // Etiqueta del valor de la alerta
        ctx.fillStyle = '#FF0000'; // Color rojo para el texto de la alerta
        ctx.font = '10px Arial';
        ctx.fillText(`Alerta: ${alertReading.value.toFixed(1)}${this.getSensorUnit(this.data.IdAlerta.TipoSensor)}`, alertX, timelineY + alertYOffset - 15);
      } else {
        // Si la alerta está resuelta, muestra una etiqueta de "Resuelta"
        ctx.fillStyle = '#4CAF50'; // Color verde para el texto de alerta resuelta
        ctx.font = '10px Arial';
        ctx.fillText(`Resuelta: ${alertReading.value.toFixed(1)}${this.getSensorUnit(this.data.IdAlerta.TipoSensor)}`, alertX, timelineY + alertYOffset - 15);
      }
    }
  }
}
