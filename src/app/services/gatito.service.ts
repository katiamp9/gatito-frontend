import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { StorageService } from './storage.service'; // Si usas el StorageService

// Modelos que corresponderían a tu API
import { Gatito } from '../models/gatitos/Gatito'; // Asegúrate de que el modelo sea correcto
import { ComentarioRequest } from '../models/gatitos/ComentarioRequest'; // Si tienes este modelo
import { GatitoReaction } from '../models/gatitos/GatitoReaction'; // Si tienes este modelo
import { Reaction } from '../models/gatitos/Reaction';

@Injectable({
  providedIn: 'root'
})
export class GatitoService {

  apiURL = 'https://gatito-api.onrender.com/api';  // Asegúrate de que esta URL sea la correcta
  token = '';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.token = this.storageService.getSession('token');  // Obtiene el token de la sesión
  }

  // Configuración de los headers para la autenticación
  getHttpOptions() {
    const token = this.storageService.getSession('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      }),
    };
  }

  getGatitos(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/gatito/all?page=${page}&size=${size}`, this.getHttpOptions())
      .pipe(retry(1), catchError(this.handleError));
  }

  postGatito(gatito: Gatito): Observable<any> {
    return this.http
      .post(this.apiURL + '/gatito/create', gatito, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  postComentarioGatito(comentario: { contenido: string; gatitoId: number }): Observable<any> {
    return this.http.post(this.apiURL + '/comentarios/create', comentario, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  postReaccionGatito(reactionData: { gatitoId: number; reactionId: number }): Observable<any> {
    return this.http.post(this.apiURL + '/reactions/create', reactionData, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getReactionCount(gatitoId: number, reactionId: number): Observable<number> {
    return this.http.get<number>(`${this.apiURL}/gatito/reacciones/count/${gatitoId}/${reactionId}`, this.getHttpOptions());
  }

  getComentariosPorGatito(gatitoId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + `/comentarios/get/${gatitoId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getAvailableReactions(): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(`${this.apiURL}/ereactions/all`);
  }

  buscarGatitos(termino: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/gatito/buscar?termino=${termino}`, this.getHttpOptions())
    .pipe(catchError(this.handleError));
  }

  deleteGatito(gatitoId: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/gatito/delete/${gatitoId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getReaccionesPorGatito(gatitoId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiURL}/reactions/get/${gatitoId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  handleError(error: any) {
    let message = '';
    if (error.error instanceof ErrorEvent) {
      message = `Error: ${error.error.message}`;
    } else {
      message = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(() => message);
  }
}
