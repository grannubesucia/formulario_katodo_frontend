import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  templateUrl: './confirmacion.html',
  styleUrls: ['./confirmacion.css']
})
export class ConfirmacionComponent {
  constructor(private router: Router) {}
  volver() { this.router.navigate(['/']); }
}