import { provideHttpClient, withFetch } from '@angular/common/http'; // Configuración de HTTP client moderno
import { provideRouter } from '@angular/router'; // Proveedor de rutas
import { routes } from './app.routes'; // Definición de rutas de la app

export const appConfig = {
  providers: [
    provideRouter(routes), // Activa el sistema de routing
    provideHttpClient(withFetch()) // Activa HttpClient usando fetch en lugar de XHR
  ]
};