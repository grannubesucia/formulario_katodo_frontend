import { CommonModule } from '@angular/common'; // Directivas comunes
import { FormsModule } from '@angular/forms'; // Formularios
import { HttpClientModule } from '@angular/common/http'; // HTTP
import { PedidoService, Pedido } from '../services/pedido.service'; // Servicio y modelo
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core'; // Angular core

@Component({
  selector: 'app-config', // Nombre del componente
  standalone: true, // Componente independiente
  imports: [CommonModule, FormsModule, HttpClientModule], // Módulos usados
  templateUrl: './config.html', // HTML
  styleUrls: ['./config.css'] // Estilos
})
export class ConfigComponent implements OnInit {

  // Login
  autenticado = false; // Estado de login
  passwordInput = ''; // Input contraseña
  errorLogin = false; // Error login
  cargandoLogin = false; // Estado carga login

  // Pedidos
  pedidos: Pedido[] = []; // Lista total
  pedidosFiltrados: Pedido[] = []; // Lista filtrada
  cargando = false; // Estado carga pedidos

  // Filtros
  filtroEstado = ''; // Filtro por estado
  filtroEmail = ''; // Filtro por email
  filtroAccesorio = ''; // Filtro accesorio
  filtroFechaDesde = ''; // Filtro fecha desde
  filtroFechaHasta = ''; // (no usado aquí)

  // Confirmación cambio estado
  mostrarConfirmacion = false; // Mostrar popup
  pedidoSeleccionado: Pedido | null = null; // Pedido activo
  nuevoEstadoSeleccionado = ''; // Nuevo estado

  estados = ['Recibido', 'En proceso', 'Listo', 'Entregado']; // Estados posibles

  estadoAnterior = ''; // Guarda estado previo

  pedidoDetalle: Pedido | null = null; // Pedido expandido

  constructor(private pedidoService: PedidoService, private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

  ngOnInit() { } // Inicialización

  intentarLogin() {
    this.cargandoLogin = true;
    this.errorLogin = false;

    this.pedidoService.login(this.passwordInput).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.ok) {
            this.autenticado = true; // Login correcto
            this.cargarPedidos(); // Carga pedidos
          } else {
            this.errorLogin = true; // Error
          }
          this.cargandoLogin = false;
          this.cdr.detectChanges(); // Refresca vista
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.errorLogin = true;
          this.cargandoLogin = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  cargarPedidos() {
    this.cargando = true;

    this.pedidoService.listarPedidos().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.pedidos = data; // Guarda pedidos
          this.aplicarFiltros(); // Aplica filtros
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  aplicarFiltros() {
    this.pedidosFiltrados = this.pedidos.filter(p => {
      const okEstado = !this.filtroEstado || p.estado === this.filtroEstado; // Filtro estado
      const okEmail = !this.filtroEmail ||
        p.emailCliente?.toLowerCase().includes(this.filtroEmail.toLowerCase()); // Filtro email
      const okAccesorio = !this.filtroAccesorio ||
        p.tipoAccesorio?.toLowerCase().includes(this.filtroAccesorio.toLowerCase()); // Filtro accesorio
      const okDesde = !this.filtroFechaDesde ||
        new Date(p.fechaCreacion!) >= new Date(this.filtroFechaDesde); // Filtro fecha

      return okEstado && okEmail && okAccesorio && okDesde;
    });
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: string) {
    this.pedidoService.actualizarEstado(pedido.id!, nuevoEstado).subscribe({
      next: (actualizado) => {
        pedido.estado = actualizado.estado; // Actualiza estado
        this.aplicarFiltros();
      }
    });
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroEmail = '';
    this.filtroAccesorio = '';
    this.filtroFechaDesde = '';
    this.aplicarFiltros(); // Reset filtros
  }

  confirmarCambioEstado(pedido: Pedido, nuevoEstado: string) {
    if (this.estadoAnterior === nuevoEstado) return; // Evita cambios innecesarios

    this.ngZone.run(() => {
      this.estadoAnterior = pedido.estado || '';
      this.pedidoSeleccionado = pedido;
      this.nuevoEstadoSeleccionado = nuevoEstado;
      this.mostrarConfirmacion = true; // Muestra popup
      this.cdr.detectChanges();
    });
  }

  cancelarCambio() {
    if (this.pedidoSeleccionado) {
      this.pedidoSeleccionado.estado = this.estadoAnterior; // Revierte cambio
    }

    this.mostrarConfirmacion = false;
    this.pedidoSeleccionado = null;
    this.nuevoEstadoSeleccionado = '';
    this.estadoAnterior = '';

    this.ngZone.run(() => this.cdr.detectChanges());
  }

  confirmarCambio() {
    if (!this.pedidoSeleccionado) return;

    this.pedidoService.actualizarEstado(this.pedidoSeleccionado.id!, this.nuevoEstadoSeleccionado).subscribe({
      next: (actualizado) => {
        this.ngZone.run(() => {
          this.pedidoSeleccionado!.estado = actualizado.estado; // Confirma cambio
          this.mostrarConfirmacion = false;
          this.pedidoSeleccionado = null;
          this.nuevoEstadoSeleccionado = '';
          this.aplicarFiltros();
          this.cdr.detectChanges();
        });
      }
    });
  }

  toggleDetalle(pedido: Pedido) {
    this.pedidoDetalle = this.pedidoDetalle?.id === pedido.id ? null : pedido; // Abre/cierra detalle
  }

}