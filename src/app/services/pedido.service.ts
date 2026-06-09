import { Injectable } from '@angular/core'; // Permite inyección del servicio
import { HttpClient } from '@angular/common/http'; // Cliente HTTP
import { Observable } from 'rxjs'; // Manejo de peticiones reactivas

// Modelo de datos de un pedido
export interface Pedido {
  id?: number; // ID opcional (backend)
  tipoPedido: string; // Propio u otra persona
  descripcionPersona: string; // Descripción del destinatario
  presupuesto: string; // Rango de precio
  tipoAccesorio: string; // Tipo de accesorio
  otroAccesorio: string; // Accesorio personalizado
  origen: string; // Origen del diseño
  referencia: string; // Referencia si está inspirado
  materiales: string; // Materiales seleccionados
  materialesConfig: string; // Configuración de materiales
  descripcionFinal: string; // Descripción final del cliente
  emailCliente: string; // Email del cliente
  estado?: string; // Estado del pedido
  fechaCreacion?: string; // Fecha de creación
}

@Injectable({
  providedIn: 'root' // Servicio global en toda la app
})
export class PedidoService {

  private apiUrl = 'https://formulario-katodo-backend.onrender.com/api/pedidos'; // Endpoint base del backend

  constructor(private http: HttpClient) { } // Inyección HTTP

  guardarPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido); // Crea pedido
  }

  listarPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl); // Obtiene todos los pedidos
  }

  actualizarEstado(id: number, estado: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/estado`, { estado }); // Cambia estado
  }

  login(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { password }); // Login admin
  }

  buscarPorEmail(email: string, codigo: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/por-email/${email}/${codigo}`); // Busca pedidos por email + código
  }

}