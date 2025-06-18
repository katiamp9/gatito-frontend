export class Gatito {
    id: number = 0;
    nombre: string = '';
    raza: string = '';
    urlFoto: string = '';
    postedBy: {
      id: number;
      username: string;
    } | null = null;
    reaccionMasVotada?: string;
    comentarios?: { id: number; contenido: string; nombreUsuario: string }[] = [];
    nuevoComentario?: string = '';
  }