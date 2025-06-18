import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { StorageService } from './storage.service';
import { Credentials } from '../models/user/Credentials';
import { User } from '../models/user/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiURL = "https://gatito-api.onrender.com/api/auth";

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  postLogin(myCredential: Credentials) {
    const body = {
      username: myCredential.username,
      password: myCredential.password
    };
  
    return this.http.post(this.apiURL + '/signin', body)
      .pipe(
        map((data: any) => {
          
          this.storageService.setSession('token', data.accessToken);
          this.storageService.setSession('userId', data.id);
          this.storageService.setSession('username', data.username);
          this.storageService.setSession('email', data.email);
          //console.log('SESSION:', this.storageService.getSession('userId'));
          return data;
        }),
        catchError((error) => this.handleError(error))
      );
  }

  createUser(user: User): Observable<any> {
    return this.http.post(`${this.apiURL}/signup`, user)
      .pipe(
        catchError((error) => {
          throw new Error('Error al registrar usuario');
        })
      );
  }
  
  logout(): void {
    this.storageService.sessionDeleteAll();
  }

  handleError(error: any) {
    let errorMessage = 'Ocurrió un error inesperado';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.status === 400 || error.status === 409) {
        errorMessage = 'Usuario o correo ya está en uso.';
      } else if (error.status === 401) {
        errorMessage = 'Credenciales inválidas.';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permiso para realizar esta acción.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado.';
      } else {
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          try {
            const errObj = JSON.parse(error.error);
            if (errObj.message) errorMessage = errObj.message;
          } catch {
            errorMessage = `Error ${error.status}: ${error.message}`;
          }
        }
      }
    }

    console.error(errorMessage);

    return throwError(() => errorMessage);
  }

}
