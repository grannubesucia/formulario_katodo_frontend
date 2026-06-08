import { Component } from '@angular/core'; // Decorador de componente
import { Router } from '@angular/router'; // Servicio de navegación

@Component({
  selector: 'app-confirmacion', // Nombre del componente
  standalone: true, // Componente independiente
  templateUrl: './confirmacion.html', // HTML asociado
  styleUrls: ['./confirmacion.css'] // Estilos
})
export class ConfirmacionComponent {
  constructor(private router: Router) { } // Inyección del router

  volver() {
    this.router.navigate(['/']); // Navega al inicio
  }
}