import { FormsModule } from '@angular/forms'; // Soporte para formularios y ngModel
import { CommonModule } from '@angular/common'; // Directivas comunes (ngIf, ngFor...)
import { HttpClientModule } from '@angular/common/http'; // Peticiones HTTP
import { PedidoService } from '../services/pedido.service'; // Servicio para guardar pedidos
import { Router } from '@angular/router'; // Navegación entre rutas
import { Component, NgZone } from '@angular/core'; // Decoradores y zona Angular

@Component({
  selector: 'app-formulario', // Nombre del componente
  standalone: true, // Componente independiente
  imports: [FormsModule, CommonModule, HttpClientModule], // Módulos usados
  templateUrl: './formulario.html', // HTML asociado
  styleUrls: ['./formulario.css'] // Estilos asociados
})
export class FormularioComponent {

  // Pasos base del formulario
  stepsBase: string[] = [
    'tipo', 'descripcion', 'presupuesto', 'accesorio',
    'origen', 'materiales', 'descripcion_final', 'email', 'resumen'
  ];

  // Genera pasos dinámicos según materiales elegidos
  get steps(): string[] {
    const s = [...this.stepsBase];
    const idx = s.indexOf('materiales') + 1;
    const extras: string[] = [];
    if (this.datos.materiales.includes('placa')) extras.push('detalle_placa');
    if (this.datos.materiales.includes('cadenas')) extras.push('detalle_cadenas');
    if (this.datos.materiales.includes('resina')) extras.push('detalle_resina');
    s.splice(idx, 0, ...extras);
    return s;
  }

  get totalPasos(): number { return this.steps.length; } // Total de pasos
  get progreso(): number { return Math.round((this.currentStep / (this.totalPasos - 1)) * 100); } // % progreso

  // Etiquetas para la barra de progreso
  labelsPasos: Record<string, string> = {
    tipo: 'Tipo',
    descripcion: 'Persona',
    presupuesto: 'Presupuesto',
    accesorio: 'Accesorio',
    origen: 'Origen',
    materiales: 'Materiales',
    detalle_placa: 'Placa',
    detalle_cadenas: 'Cadenas',
    detalle_resina: 'Resina',
    descripcion_final: 'Idea',
    email: 'Email',
    resumen: 'Resumen'
  };

  currentStep = 0; // Paso actual
  historial: number[] = []; // Historial para retroceder
  enviando = false; // Estado de envío
  enviado = false;
  errorEnvio = false;
  pedidoEnviado = false;

  // Datos del formulario
  datos: any = {
    tipoPedido: '', descripcionPersona: '', presupuesto: '',
    tipoAccesorio: '', otroAccesorio: '', origen: '', referencia: '',
    materiales: [], descripcionFinal: '', emailCliente: ''
  };

  // Configuración de materiales
  materialesConfig = {
    placa: { nivel: 2, color: '' },
    cadenas: { color: '', tipo: '', enganche: '' },
    enganches: { color: '', tipo: '' },
    resina: { tipo: '', color: '' }
  };

  nivelesPlaca = ['Sin microcomponentes', 'Muy ligero', 'Equilibrado', 'Detallado', 'Muy detallado']; // Niveles placa

  fotosAccesorio: string[] = []; // Imágenes accesorio
  indiceCarrusel = 0; // Índice carrusel

  // Rutas de imágenes por accesorio
  fotosPor: Record<string, string[]> = {
    anillo: Array.from({ length: 4 }, (_, i) => `accesorios/anillo/${i + 1}.jpg`),
    colgante: Array.from({ length: 4 }, (_, i) => `accesorios/colgante/${i + 1}.jpg`),
    gargantilla: Array.from({ length: 4 }, (_, i) => `accesorios/gargantilla/${i + 1}.jpg`),
    pendientes: Array.from({ length: 4 }, (_, i) => `accesorios/pendientes/${i + 1}.jpg`),
    brazalete: Array.from({ length: 4 }, (_, i) => `accesorios/brazalete/${i + 1}.jpg`),
    esclava: Array.from({ length: 4 }, (_, i) => `accesorios/esclava/${i + 1}.jpg`),
    llavero: Array.from({ length: 4 }, (_, i) => `accesorios/llavero/${i + 1}.jpg`),
    otro: Array.from({ length: 4 }, (_, i) => `accesorios/otro/${i + 1}.jpg`),
  };

  indiceCadena = 0; // Índice carrusel cadenas

  // Imágenes de cadenas por color
  fotosCadenas: Record<string, string[]> = {
    plateado: Array.from({ length: 5 }, (_, i) => `materiales/cadenas/plateado/${i + 1}.jpg`),
    negro: Array.from({ length: 5 }, (_, i) => `materiales/cadenas/negro/${i + 1}.jpg`),
    dorado: Array.from({ length: 4 }, (_, i) => `materiales/cadenas/dorado/${i + 1}.jpg`),
  };

  indiceEngancheIndep = 0; // Índice enganches

  // Imágenes de enganches
  fotosEnganches: Record<string, string[]> = {
    plateado: Array.from({ length: 4 }, (_, i) => `materiales/enganches/plateado/${i + 1}.jpg`),
    negro: Array.from({ length: 2 }, (_, i) => `materiales/enganches/negro/${i + 1}.jpg`),
    dorado: Array.from({ length: 2 }, (_, i) => `materiales/enganches/dorado/${i + 1}.jpg`),
  };

  fotosNivelesPlaca: string[] = Array.from({ length: 5 }, (_, i) => `materiales/placa/niveles/${i + 1}.jpg`); // Niveles placa

  coloresPlacaOpciones = ['verde', 'negro', 'azul', 'amarillo', 'rojo', 'blanco']; // Colores placa

  // Imágenes de colores de placa
  fotosColoresPlaca: Record<string, string> = {
    verde: 'materiales/placa/colores/verde.jpg',
    negro: 'materiales/placa/colores/negro.jpg',
    azul: 'materiales/placa/colores/azul.jpg',
    amarillo: 'materiales/placa/colores/amarillo.jpg',
    rojo: 'materiales/placa/colores/rojo.jpg',
    blanco: 'materiales/placa/colores/blanco.jpg',
  };

  coloresMetalOpciones = ['plateado', 'negro', 'dorado']; // Colores metálicos
  tiposResinaOpciones = ['transparente', 'tinta', 'metalliquido']; // Tipos resina

  // Imágenes de resina
  fotosResina: Record<string, string> = {
    transparente: 'materiales/resina/transparente.jpg',
    tinta: 'materiales/resina/tinta.jpg',
    metalliquido: 'materiales/resina/metalliquido.jpg',
  };

  constructor(private pedidoService: PedidoService, private router: Router, private ngZone: NgZone) { } // Inyección servicios

  get pasoActual(): string {
    return this.steps[this.currentStep] as string; // Paso actual dinámico
  }

  volverAlInicio() { this.router.navigate(['/']); } // Ir a inicio

  irAPaso(index: number) {
    if (index < this.currentStep) {
      this.currentStep = index; // Permite retroceder en la barra
    }
  }

  siguiente() {
    this.historial.push(this.currentStep); // Guarda historial

    const pasoActual = this.steps[this.currentStep];

    // Lógica especial para salto de pasos
    if (pasoActual === 'tipo') {
      const siguientePaso = this.datos.tipoPedido === 'otra'
        ? 'descripcion'
        : 'presupuesto';

      this.currentStep = this.steps.indexOf(siguientePaso);
      return;
    }

    this.currentStep++; // Avanza paso
  }

  anterior() {
    const prev = this.historial.pop();
    if (prev !== undefined) {
      this.currentStep = prev; // Vuelve atrás
    }
  }

  // Navegación entre opciones (placa, cadena, etc.)
  anteriorColorPlaca() { /* cambia color placa atrás */ }
  siguienteColorPlaca() { /* cambia color placa adelante */ }
  anteriorColorCadena() { /* cambia color cadena atrás */ }
  siguienteColorCadena() { /* cambia color cadena adelante */ }
  anteriorColorEnganche() { /* cambia color enganche atrás */ }
  siguienteColorEnganche() { /* cambia color enganche adelante */ }
  anteriorTipoResina() { /* cambia tipo resina atrás */ }
  siguienteTipoResina() { /* cambia tipo resina adelante */ }

  toggleMaterial(material: string, event: any) {
    const checked = event.target.checked;
    if (checked) {
      if (!this.datos.materiales.includes(material)) this.datos.materiales.push(material); // Añade material
    } else {
      this.datos.materiales = this.datos.materiales.filter((m: string) => m !== material); // Elimina material
    }
  }

  enviarPedido() {
    this.enviando = true;
    this.errorEnvio = false;

    const pedidoPayload = {
      ...this.datos,
      materiales: JSON.stringify(this.datos.materiales),
      materialesConfig: JSON.stringify(this.materialesConfig)
    };

    this.pedidoService.guardarPedido(pedidoPayload).subscribe({
      next: (respuesta) => {
        console.log('Pedido guardado con id:', respuesta.id);
        this.enviando = false;
        this.router.navigate(['/confirmacion']);
      },
      error: (err) => {
        console.error('Error:', err);
        this.enviando = false;
        this.errorEnvio = true;
      }
    });
  }

  volverInicio() {
    // Reinicia todo el formulario
    this.pedidoEnviado = false;
    this.enviado = false;
    this.errorEnvio = false;
    this.enviando = false;
    this.currentStep = 0;
    this.historial = [];
    this.datos = {
      tipoPedido: '', descripcionPersona: '', presupuesto: '',
      tipoAccesorio: '', otroAccesorio: '', origen: '', referencia: '',
      materiales: [], descripcionFinal: '', emailCliente: ''
    };
    this.materialesConfig = {
      placa: { nivel: 2, color: '' },
      cadenas: { color: '', tipo: '', enganche: '' },
      enganches: { color: '', tipo: '' },
      resina: { tipo: '', color: '' }
    };
  }

  onAccesorioChange() {
    this.fotosAccesorio = this.fotosPor[this.datos.tipoAccesorio] || []; // Actualiza carrusel
    this.indiceCarrusel = 0;
  }

  // Control carruseles
  carruselAnterior() { if (this.indiceCarrusel > 0) this.indiceCarrusel--; }
  carruselSiguiente() { if (this.indiceCarrusel < this.fotosAccesorio.length - 1) this.indiceCarrusel++; }

  get fotosCadenaActual(): string[] {
    return this.fotosCadenas[this.materialesConfig.cadenas.color] || []; // Imágenes actuales cadena
  }

  onColorCadenaChange() { this.indiceCadena = 0; }

  cadenaAnterior() { if (this.indiceCadena > 0) this.indiceCadena--; }
  cadenaSiguiente() { if (this.indiceCadena < this.fotosCadenaActual.length - 1) this.indiceCadena++; }

  get fotosEngancheIndepActual(): string[] {
    return this.fotosEnganches[this.materialesConfig.enganches.color] || []; // Imágenes enganches
  }

  onColorEngancheChange() { this.indiceEngancheIndep = 0; }

  engancheIndepAnterior() { if (this.indiceEngancheIndep > 0) this.indiceEngancheIndep--; }
  engancheIndepSiguiente() { if (this.indiceEngancheIndep < this.fotosEngancheIndepActual.length - 1) this.indiceEngancheIndep++; }

  get fotoColorPlacaActual(): string {
    return this.fotosColoresPlaca[this.materialesConfig.placa.color] || ''; // Imagen color placa
  }

  get fotoResinaActual(): string {
    return this.fotosResina[this.materialesConfig.resina.tipo] || ''; // Imagen resina
  }

  accesoriosOpciones = ['anillo', 'colgante', 'gargantilla', 'pendientes', 'brazalete', 'esclava', 'llavero', 'otro']; // Lista accesorios

  anteriorAccesorio() {
    const idx = this.accesoriosOpciones.indexOf(this.datos.tipoAccesorio);
    if (idx > 0) {
      this.datos.tipoAccesorio = this.accesoriosOpciones[idx - 1]; // Cambia atrás
      this.onAccesorioChange();
    }
  }

  siguienteAccesorio() {
    const idx = this.accesoriosOpciones.indexOf(this.datos.tipoAccesorio);
    if (idx < this.accesoriosOpciones.length - 1) {
      this.datos.tipoAccesorio = this.accesoriosOpciones[idx + 1]; // Cambia adelante
      this.onAccesorioChange();
    }
  }
}