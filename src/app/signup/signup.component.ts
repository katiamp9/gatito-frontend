import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../models/user/User';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  user: User = new User();  
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSignup(): void {
    if (this.user.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    this.authService.createUser(this.user).subscribe(
      (data) => {
        console.log('Usuario registrado', data);

        this.router.navigate(['/login']);
      },
      (error) => {
        this.errorMessage = 'Error al registrar usuario';
      }
    );
  }
}
