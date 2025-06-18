import { Component } from '@angular/core';
import { Gatito } from '../models/gatitos/Gatito';
import { GatitoService } from '../services/gatito.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { Reaction } from '../models/gatitos/Reaction';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  gatitos: any[] = [];
  newGatito: any = {};  // Objeto para crear un nuevo gatito
  terminoBusqueda: string = '';  // Para buscar gatitos
  modoBusquedaActiva: boolean = false;
  selectedGatitoId: number | null = null;
  gatitoReacciones: { [gatitoId: number]: { [reaction: string]: number } } = {};
  currentUserId: number=0;
  reactions: Reaction[] = [];
  showForm: boolean = false;
  errorMessage: string = ''; 
  formErrorMessage: string = ''; 

  constructor(
    private gatitoService: GatitoService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.currentUserId = Number(sessionStorage.getItem('userId'));
      if (isNaN(this.currentUserId)) {
        console.error('Error: el userId no es un número válido');
        console.log(this.currentUserId, sessionStorage.getItem('userId'));
      } else {
        console.log('userId del usuario logueado:', this.currentUserId);
      }
  }

  ngOnInit() {
    this.loadGatitos();
    this.loadReactions();
  }

  loadGatitos() {
    this.gatitoService.getGatitos().subscribe(
      (data) => {
        this.gatitos = data.content;
        this.gatitos.sort((a, b) => b.id - a.id);
        this.gatitos.forEach((gatito) => {
          this.loadReacciones(gatito.id);
          this.gatitoService.getComentariosPorGatito(gatito.id).subscribe((comentarios) => {
            gatito.comentarios = comentarios;
            //console.log(gatito);
          });
        });
      },
      (error) => {
        console.error('Error cargando gatitos', error);
      }
    );
  }

  loadReactions(): void {
    this.gatitoService.getAvailableReactions().subscribe(
      (data) => {
        this.reactions = data;  // Guardamos las reacciones en el array
        //console.log('Reacciones cargadas:', this.reactions);
      },
      (error) => {
        console.error('Error al cargar reacciones:', error);
      }
    );
  }

  loadReacciones(gatitoId: number) {
    this.reactions.forEach((reaction) => {
      const reactionId = reaction.id;
      this.gatitoService.getReactionCount(gatitoId, reactionId).subscribe(
        (count) => {
          this.gatitoReacciones[gatitoId] = this.gatitoReacciones[gatitoId] || {};
          this.gatitoReacciones[gatitoId][reaction.description] = count;
        },
        (error) => {
          console.error(`Error al obtener la reacción ${reaction.description} para el gatito ${gatitoId}`, error);
        }
      );
    });
  }
  
  postNewGatito() {
    if (!this.validateForm()) {
      return;
    }
    if (!this.validateImageUrl(this.newGatito.urlFoto)) {
      this.errorMessage = 'La URL de la foto debe terminar en .png, .jpeg o .jpg';
      return;
    }

    if (this.newGatito.nombre && this.newGatito.raza) {
      this.gatitoService.postGatito(this.newGatito).subscribe(
        (data) => {
          this.gatitos.unshift(data);
          this.newGatito = {};
        },
        (error) => {
          console.error('Error al crear gatito', error);
        }
      );
    } else {
      alert('Por favor, completa todos los campos.');
    }
  }
  postReaction(gatitoId: number, reactionId: number) {
    const reactionData = {
          gatitoId: gatitoId,
          reactionId: reactionId
        };
    this.gatitoService.postReaccionGatito(reactionData).subscribe(
      (response) => {
        console.log('Reacción registrada:', response);
        this.loadGatitos();
      },
      (error) => {
        console.error('Error al registrar la reacción:', error);
      }
    );
  }

  postComentario(gatitoId: number, contenido: string) {
    if (!contenido.trim()) return;
    const comentario = { contenido, gatitoId };

    this.gatitoService.postComentarioGatito(comentario).subscribe(
      (data) => {
        console.log('Comentario creado:', data);
        this.loadGatitos();
      },
      (error) => {
        console.error('Error al crear comentario', error);
      }
    );
  }
  confirmDeleteGatito(gatitoId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteGatito(gatitoId);
      }
    });
  }
  
  
  deleteGatito(gatitoId: number) {
    this.gatitoService.deleteGatito(gatitoId).subscribe(
      (response) => {
        console.log('Gatito eliminado:', response);
        this.loadGatitos(); 
      },
      (error) => {
        console.error('Error al eliminar el gatito:', error);
        this.loadGatitos(); 
      }
    );
  }

  logout() {
    this.storageService.sessionDeleteByKey('token');
    this.router.navigate(['/login']);
  }

  buscarGatitos() {
    if (this.terminoBusqueda.trim() !== '') {
      this.gatitoService.buscarGatitos(this.terminoBusqueda).subscribe(
        (data) => {
          this.gatitos = data; 
        },
        (error) => {
          console.error('Error al buscar gatitos', error);
        }
      );
    } else {
      this.loadGatitos();
    }
  }

  toggleComentarios(gatitoId: number): void {
    if (this.selectedGatitoId === gatitoId) {
      this.selectedGatitoId = null;
    } else {
      this.selectedGatitoId = gatitoId;
    }
  }
  toggleCreateGatitoForm() {
    this.showForm = !this.showForm;
  }

  validateImageUrl(url: string): boolean {
    // Expresión regular para verificar si la URL termina en .png, .jpeg o .jpg
    const regex = /\.(png|jpg|jpeg)$/i;
    return regex.test(url);
  }
  validateForm() {
    if (!this.newGatito.nombre || !this.newGatito.raza) {
      this.errorMessage = 'Por favor, completa todos los campos (nombre y raza).';
      return false;
    }
    return true;
  }
}
