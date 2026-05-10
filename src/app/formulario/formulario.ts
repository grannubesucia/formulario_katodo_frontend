import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PedidoService } from '../services/pedido.service';
import { Router } from '@angular/router';
import { Component, NgZone } from '@angular/core';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './formulario.html',
  styleUrls: ['./formulario.css']
})
export class FormularioComponent {

  // Pasos base — los de materiales se insertan dinámicamente
  stepsBase: string[] = [
    'tipo', 'descripcion', 'presupuesto', 'accesorio',
    'origen', 'materiales', 'descripcion_final', 'email', 'resumen'
  ];

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

  get totalPasos(): number { return this.steps.length; }
  get progreso(): number { return Math.round((this.currentStep / (this.totalPasos - 1)) * 100); }

  // Labels para la barra de progreso
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

  currentStep = 0;
  historial: number[] = [];
  enviando = false;
  enviado = false;
  errorEnvio = false;
  pedidoEnviado = false;

  datos: any = {
    tipoPedido: '', descripcionPersona: '', presupuesto: '',
    tipoAccesorio: '', otroAccesorio: '', origen: '', referencia: '',
    materiales: [], descripcionFinal: '', emailCliente: ''
  };

  materialesConfig = {
    placa: { nivel: 2, color: '' },
    cadenas: { color: '', tipo: '', enganche: '' },
    enganches: { color: '', tipo: '' },
    resina: { tipo: '', color: '' }
  };

  nivelesPlaca = ['Sin microcomponentes', 'Muy ligero', 'Equilibrado', 'Detallado', 'Muy detallado'];

  fotosAccesorio: string[] = [];
  indiceCarrusel = 0;

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

  indiceCadena = 0;
  fotosCadenas: Record<string, string[]> = {
    plateado: Array.from({ length: 5 }, (_, i) => `materiales/cadenas/plateado/${i + 1}.jpg`),
    negro: Array.from({ length: 5 }, (_, i) => `materiales/cadenas/negro/${i + 1}.jpg`),
    dorado: Array.from({ length: 4 }, (_, i) => `materiales/cadenas/dorado/${i + 1}.jpg`),
  };

  indiceEngancheIndep = 0;
  fotosEnganches: Record<string, string[]> = {
    plateado: Array.from({ length: 4 }, (_, i) => `materiales/enganches/plateado/${i + 1}.jpg`),
    negro: Array.from({ length: 2 }, (_, i) => `materiales/enganches/negro/${i + 1}.jpg`),
    dorado: Array.from({ length: 2 }, (_, i) => `materiales/enganches/dorado/${i + 1}.jpg`),
  };

  fotosNivelesPlaca: string[] = Array.from({ length: 5 }, (_, i) => `materiales/placa/niveles/${i + 1}.jpg`);

  coloresPlacaOpciones = ['verde', 'negro', 'azul', 'amarillo', 'rojo', 'blanco'];

  fotosColoresPlaca: Record<string, string> = {
    verde: 'materiales/placa/colores/verde.jpg',
    negro: 'materiales/placa/colores/negro.jpg',
    azul: 'materiales/placa/colores/azul.jpg',
    amarillo: 'materiales/placa/colores/amarillo.jpg',
    rojo: 'materiales/placa/colores/rojo.jpg',
    blanco: 'materiales/placa/colores/blanco.jpg',
  };

  coloresMetalOpciones = ['plateado', 'negro', 'dorado'];

  tiposResinaOpciones = ['transparente', 'tinta', 'metalliquido'];

  fotosResina: Record<string, string> = {
    transparente: 'materiales/resina/transparente.jpg',
    tinta: 'materiales/resina/tinta.jpg',
    metalliquido: 'materiales/resina/metalliquido.jpg',
  };





  constructor(private pedidoService: PedidoService, private router: Router, private ngZone: NgZone) { }

  get pasoActual(): string {
    return this.steps[this.currentStep] as string;
  }

  volverAlInicio() { this.router.navigate(['/']); }

  irAPaso(index: number) {
    if (index < this.currentStep) {
      this.currentStep = index;
    }
  }

  siguiente() {
    this.historial.push(this.currentStep);

    const pasoActual = this.steps[this.currentStep];

    if (pasoActual === 'tipo') {
      const siguientePaso = this.datos.tipoPedido === 'otra'
        ? 'descripcion'
        : 'presupuesto';

      this.currentStep = this.steps.indexOf(siguientePaso);
      return;
    }

    this.currentStep++;
  }

  anterior() {
    const prev = this.historial.pop();
    if (prev !== undefined) {
      this.currentStep = prev;
    }
  }

  anteriorColorPlaca() {
    const i = this.coloresPlacaOpciones.indexOf(this.materialesConfig.placa.color);
    if (i > 0) this.materialesConfig.placa.color = this.coloresPlacaOpciones[i - 1];
  }

  siguienteColorPlaca() {
    const i = this.coloresPlacaOpciones.indexOf(this.materialesConfig.placa.color);
    if (i < this.coloresPlacaOpciones.length - 1) {
      this.materialesConfig.placa.color = this.coloresPlacaOpciones[i + 1];
    }
  }

  anteriorColorCadena() {
    const i = this.coloresMetalOpciones.indexOf(this.materialesConfig.cadenas.color);
    if (i > 0) this.materialesConfig.cadenas.color = this.coloresMetalOpciones[i - 1];
  }

  siguienteColorCadena() {
    const i = this.coloresMetalOpciones.indexOf(this.materialesConfig.cadenas.color);
    if (i < this.coloresMetalOpciones.length - 1) {
      this.materialesConfig.cadenas.color = this.coloresMetalOpciones[i + 1];
    }
  }

  anteriorColorEnganche() {
    const i = this.coloresMetalOpciones.indexOf(this.materialesConfig.enganches.color);
    if (i > 0) this.materialesConfig.enganches.color = this.coloresMetalOpciones[i - 1];
  }

  siguienteColorEnganche() {
    const i = this.coloresMetalOpciones.indexOf(this.materialesConfig.enganches.color);
    if (i < this.coloresMetalOpciones.length - 1) {
      this.materialesConfig.enganches.color = this.coloresMetalOpciones[i + 1];
    }
  }

  anteriorTipoResina() {
    const i = this.tiposResinaOpciones.indexOf(this.materialesConfig.resina.tipo);
    if (i > 0) this.materialesConfig.resina.tipo = this.tiposResinaOpciones[i - 1];
  }

  siguienteTipoResina() {
    const i = this.tiposResinaOpciones.indexOf(this.materialesConfig.resina.tipo);
    if (i < this.tiposResinaOpciones.length - 1) {
      this.materialesConfig.resina.tipo = this.tiposResinaOpciones[i + 1];
    }
  }

  toggleMaterial(material: string, event: any) {
    const checked = event.target.checked;
    if (checked) {
      if (!this.datos.materiales.includes(material)) this.datos.materiales.push(material);
    } else {
      this.datos.materiales = this.datos.materiales.filter((m: string) => m !== material);
    }
  }

  enviarPedido() {
    const pedidoPayload = {
      ...this.datos,
      materiales: JSON.stringify(this.datos.materiales),
      materialesConfig: JSON.stringify(this.materialesConfig)
    };
    this.pedidoService.guardarPedido(pedidoPayload).subscribe({
      next: (respuesta) => {
        console.log('Pedido guardado con id:', respuesta.id);
        this.router.navigate(['/confirmacion']);
      },
      error: (err) => {
        console.error('Error:', err);
        this.errorEnvio = true;
      }
    });
  }

  volverInicio() {
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
    this.fotosAccesorio = this.fotosPor[this.datos.tipoAccesorio] || [];
    this.indiceCarrusel = 0;
  }
  carruselAnterior() { if (this.indiceCarrusel > 0) this.indiceCarrusel--; }
  carruselSiguiente() { if (this.indiceCarrusel < this.fotosAccesorio.length - 1) this.indiceCarrusel++; }

  get fotosCadenaActual(): string[] {
    return this.fotosCadenas[this.materialesConfig.cadenas.color] || [];
  }
  onColorCadenaChange() { this.indiceCadena = 0; }
  cadenaAnterior() { if (this.indiceCadena > 0) this.indiceCadena--; }
  cadenaSiguiente() { if (this.indiceCadena < this.fotosCadenaActual.length - 1) this.indiceCadena++; }

  get fotosEngancheIndepActual(): string[] {
    return this.fotosEnganches[this.materialesConfig.enganches.color] || [];
  }
  onColorEngancheChange() { this.indiceEngancheIndep = 0; }
  engancheIndepAnterior() { if (this.indiceEngancheIndep > 0) this.indiceEngancheIndep--; }
  engancheIndepSiguiente() { if (this.indiceEngancheIndep < this.fotosEngancheIndepActual.length - 1) this.indiceEngancheIndep++; }

  get fotoColorPlacaActual(): string {
    return this.fotosColoresPlaca[this.materialesConfig.placa.color] || '';
  }

  get fotoResinaActual(): string {
    return this.fotosResina[this.materialesConfig.resina.tipo] || '';
  }

  accesoriosOpciones = ['anillo', 'colgante', 'gargantilla', 'pendientes', 'brazalete', 'esclava', 'llavero', 'otro'];

  anteriorAccesorio() {
    const idx = this.accesoriosOpciones.indexOf(this.datos.tipoAccesorio);
    if (idx > 0) {
      this.datos.tipoAccesorio = this.accesoriosOpciones[idx - 1];
      this.onAccesorioChange();
    }
  }

  siguienteAccesorio() {
    const idx = this.accesoriosOpciones.indexOf(this.datos.tipoAccesorio);
    if (idx < this.accesoriosOpciones.length - 1) {
      this.datos.tipoAccesorio = this.accesoriosOpciones[idx + 1];
      this.onAccesorioChange();
    }
  }
}