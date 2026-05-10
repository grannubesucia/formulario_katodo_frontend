import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PedidoService, Pedido } from '../services/pedido.service';
import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './config.html',
  styleUrls: ['./config.css']
})
export class ConfigComponent implements OnInit {

  // Login
  autenticado = false;
  passwordInput = '';
  errorLogin = false;
  cargandoLogin = false;

  // Pedidos
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  cargando = false;

  // Filtros
  filtroEstado = '';
  filtroEmail = '';
  filtroAccesorio = '';
  filtroFechaDesde = '';
  filtroFechaHasta = '';

  mostrarConfirmacion = false;
  pedidoSeleccionado: Pedido | null = null;
  nuevoEstadoSeleccionado = '';

  estados = ['Recibido', 'En proceso', 'Listo', 'Entregado'];

  estadoAnterior = '';

  constructor(private pedidoService: PedidoService, private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

  ngOnInit() { }

  intentarLogin() {
    this.cargandoLogin = true;
    this.errorLogin = false;
    this.pedidoService.login(this.passwordInput).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          if (res.ok) {
            this.autenticado = true;
            this.cargarPedidos();
          } else {
            this.errorLogin = true;
          }
          this.cargandoLogin = false;
          this.cdr.detectChanges();
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
          this.pedidos = data;
          this.aplicarFiltros();
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
      const okEstado = !this.filtroEstado || p.estado === this.filtroEstado;
      const okEmail = !this.filtroEmail ||
        p.emailCliente?.toLowerCase().includes(this.filtroEmail.toLowerCase());
      const okAccesorio = !this.filtroAccesorio ||
        p.tipoAccesorio?.toLowerCase().includes(this.filtroAccesorio.toLowerCase());
      const okDesde = !this.filtroFechaDesde ||
        new Date(p.fechaCreacion!) >= new Date(this.filtroFechaDesde);
      const okHasta = !this.filtroFechaHasta ||
        new Date(p.fechaCreacion!) <= new Date(this.filtroFechaHasta + 'T23:59:59');
      return okEstado && okEmail && okAccesorio && okDesde && okHasta;
    });
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: string) {
    this.pedidoService.actualizarEstado(pedido.id!, nuevoEstado).subscribe({
      next: (actualizado) => {
        pedido.estado = actualizado.estado;
        this.aplicarFiltros();
      }
    });
  }

  /*
  En este método se limpian todos los filtros de búsqueda y se vuelven a aplicar para mostrar la lista completa de pedidos sin ningún filtro activo.
  */

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroEmail = '';
    this.filtroAccesorio = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.aplicarFiltros();
  }

  /*
  En este método se inicia el proceso de cambio de estado de un pedido. Se verifica si el nuevo estado es diferente al actual, y si es así, se almacena el pedido seleccionado y el nuevo estado en variables, y se muestra la ventana de confirmación para que el usuario confirme o cancele el cambio.
  */

  confirmarCambioEstado(pedido: Pedido, nuevoEstado: string) {
    if (this.estadoAnterior === nuevoEstado) return;
    this.ngZone.run(() => {
      this.estadoAnterior = pedido.estado || '';
      this.pedidoSeleccionado = pedido;
      this.nuevoEstadoSeleccionado = nuevoEstado;
      this.mostrarConfirmacion = true;
      this.cdr.detectChanges();
    });
  }

  /*
  En este método se cancela el cambio de estado del pedido seleccionado. Se oculta la ventana de confirmación y se limpian las variables relacionadas con el pedido seleccionado y el nuevo estado. Luego, se vuelven a aplicar los filtros para asegurarse de que la lista de pedidos refleje el estado actual.
  */

  cancelarCambio() {
    if (this.pedidoSeleccionado) {
      this.pedidoSeleccionado.estado = this.estadoAnterior;
    }
    this.mostrarConfirmacion = false;
    this.pedidoSeleccionado = null;
    this.nuevoEstadoSeleccionado = '';
    this.estadoAnterior = '';
    this.ngZone.run(() => this.cdr.detectChanges());
  }

  /*
  En este método se confirma el cambio de estado del pedido seleccionado. Se llama al servicio para actualizar el estado en el backend y, una vez actualizado, se refleja el cambio en la interfaz de usuario. Además, se oculta la ventana de confirmación y se limpian las variables relacionadas con el pedido seleccionado y el nuevo estado.
  */

  confirmarCambio() {
    if (!this.pedidoSeleccionado) return;
    this.pedidoService.actualizarEstado(this.pedidoSeleccionado.id!, this.nuevoEstadoSeleccionado).subscribe({
      next: (actualizado) => {
        this.ngZone.run(() => {
          this.pedidoSeleccionado!.estado = actualizado.estado;
          this.mostrarConfirmacion = false;
          this.pedidoSeleccionado = null;
          this.nuevoEstadoSeleccionado = '';
          this.aplicarFiltros();
          this.cdr.detectChanges();
        });
      }
    });
  }
}