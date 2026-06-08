import { bootstrapApplication } from '@angular/platform-browser'; // Función para arrancar una app standalone en Angular
import { App } from './app/app'; // Componente raíz de la aplicación
import { appConfig } from './app/app.config'; // Configuración global (providers, router, http, etc.)

bootstrapApplication(App, appConfig); // Inicia la aplicación con el componente raíz y su configuración