import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class LandingComponent {

  constructor(private router: Router) {}

  irFormulario() {
    this.router.navigate(['/formulario']);
  }

  irEstado() {
    this.router.navigate(['/estado']);
  }

  irConfig() {
    this.router.navigate(['/config']);
  }

}