import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PedidoService, Pedido } from '../services/pedido.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-estado',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './estado.html',
    styleUrls: ['./estado.css']
})
export class EstadoComponent {

    email = '';
    codigo = '';
    pedidos: Pedido[] = [];
    buscado = false;
    cargando = false;
    errorCodigo = false;

    constructor(
        private pedidoService: PedidoService,
        private router: Router,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef
    ) { }

    volver() {
        this.router.navigate(['/']);
    }

    buscar() {
        if (!this.email || !this.codigo) return;
        this.cargando = true;
        this.buscado = false;
        this.errorCodigo = false;
        this.pedidos = [];
        this.pedidoService.buscarPorEmail(this.email, this.codigo).subscribe({
            next: (data: Pedido[]) => {
                this.ngZone.run(() => {
                    this.pedidos = [...data];
                    this.buscado = true;
                    this.cargando = false;
                    if (data.length === 0) this.errorCodigo = true;
                    this.cdr.detectChanges();
                });
            },
            error: () => {
                this.ngZone.run(() => {
                    this.cargando = false;
                    this.buscado = true;
                    this.errorCodigo = true;
                    this.cdr.detectChanges();
                });
            }
        });
    }
}