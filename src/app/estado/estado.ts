import { Component, NgZone, ChangeDetectorRef } from '@angular/core'; // Componentes y control de detección de cambios
import { CommonModule } from '@angular/common'; // Directivas comunes
import { FormsModule } from '@angular/forms'; // Formularios
import { HttpClientModule } from '@angular/common/http'; // HTTP
import { PedidoService, Pedido } from '../services/pedido.service'; // Servicio y modelo de pedido
import { Router } from '@angular/router'; // Navegación

@Component({
    selector: 'app-estado', // Nombre del componente
    standalone: true, // Componente independiente
    imports: [CommonModule, FormsModule, HttpClientModule], // Módulos usados
    templateUrl: './estado.html', // HTML asociado
    styleUrls: ['./estado.css'] // Estilos
})
export class EstadoComponent {

    email = ''; // Email introducido
    codigo = ''; // Código de pedido
    pedidos: Pedido[] = []; // Lista de pedidos encontrados
    buscado = false; // Indica si se ha buscado
    cargando = false; // Estado de carga
    errorCodigo = false; // Error en búsqueda

    constructor(
        private pedidoService: PedidoService, // Servicio de pedidos
        private router: Router, // Router
        private ngZone: NgZone, // Zona Angular
        private cdr: ChangeDetectorRef // Forzar actualización de vista
    ) { }

    volver() {
        this.router.navigate(['/']); // Vuelve al inicio
    }

    buscar() {
        if (!this.email || !this.codigo) return; // Validación básica

        this.cargando = true; // Activa loading
        this.buscado = false;
        this.errorCodigo = false;
        this.pedidos = [];

        this.pedidoService.buscarPorEmail(this.email, this.codigo).subscribe({
            next: (data: Pedido[]) => {
                this.ngZone.run(() => { // Asegura ejecución en Angular
                    this.pedidos = [...data]; // Guarda resultados
                    this.buscado = true;
                    this.cargando = false;
                    if (data.length === 0) this.errorCodigo = true; // Sin resultados = error
                    this.cdr.detectChanges(); // Fuerza refresco
                });
            },
            error: () => {
                this.ngZone.run(() => {
                    this.cargando = false;
                    this.buscado = true;
                    this.errorCodigo = true; // Error en petición
                    this.cdr.detectChanges(); // Refresca vista
                });
            }
        });
    }
}