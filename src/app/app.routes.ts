import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing';
import { FormularioComponent } from './formulario/formulario';
import { ConfigComponent } from './config/config';
import { ConfirmacionComponent } from './confirmacion/confirmacion';
import { EstadoComponent } from './estado/estado';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'formulario', component: FormularioComponent },
  { path: 'config', component: ConfigComponent },
  { path: 'confirmacion', component: ConfirmacionComponent },
  { path: 'estado', component: EstadoComponent }
];