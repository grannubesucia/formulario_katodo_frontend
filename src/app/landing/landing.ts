import { Component } from '@angular/core'; // Importa el decorador Component
import { Router } from '@angular/router'; // Importa el servicio de rutas

@Component({
  selector: 'app-landing', // Nombre del componente en HTML
  standalone: true, // Indica que es un componente independiente
  templateUrl: './landing.html', // Archivo HTML asociado
  styleUrls: ['./landing.css'] // Archivo de estilos asociado
})
export class LandingComponent {

  constructor(private router: Router) { } // Inyección del servicio Router

  irFormulario() {
    this.router.navigate(['/formulario']); // Navega a la página de formulario
  }

  irEstado() {
    this.router.navigate(['/estado']); // Navega a la página de estado
  }

  irConfig() {
    this.router.navigate(['/config']); // Navega a la página de configuración
  }

}