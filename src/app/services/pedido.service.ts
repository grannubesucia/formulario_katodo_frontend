import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pedido {
  id?: number;
  tipoPedido: string;
  descripcionPersona: string;
  presupuesto: string;
  tipoAccesorio: string;
  otroAccesorio: string;
  origen: string;
  referencia: string;
  materiales: string;
  materialesConfig: string;
  descripcionFinal: string;
  emailCliente: string;
  estado?: string;
  fechaCreacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private apiUrl = '/api/pedidos';

  constructor(private http: HttpClient) { }

  guardarPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  listarPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  actualizarEstado(id: number, estado: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  login(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { password });
  }

  buscarPorEmail(email: string, codigo: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/por-email/${email}/${codigo}`);
  }

}