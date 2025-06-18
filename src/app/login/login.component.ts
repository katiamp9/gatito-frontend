import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string='';
  passwordFieldType: string = 'password';

  constructor(
    private authService: AuthService, 
    private storageService: StorageService,
    private router: Router) {}

    onLogin(): void {
      const credentials = { username: this.username, password: this.password };
  
      this.authService.postLogin(credentials).subscribe(
        (data) => {
          // Login exitoso
          console.log('Login exitoso');
          this.router.navigate(['/home']);
        },
        (error) => {
          this.errorMessage = 'Usuario o contraseña incorrectos';
        }
      );
    }  
    
}
