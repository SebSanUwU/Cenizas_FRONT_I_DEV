import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RoomsService } from 'src/app/services/rooms/rooms.service';
import { RoomJson } from 'src/app/schemas/RoomJson';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css','../../../assets/style/main.css'] 
})
export class SearchComponent {
  codigoSala: string = '';
  server_name: string = '';
  rooms: RoomJson[] = [];

  constructor(private roomService: RoomsService, private router: Router) {}

  ngOnInit(): void {
    this.listRooms(); 
  }

  joinRoom(codigoSala: string) {
    this.roomService.getRoom(codigoSala).subscribe(
      (response) => {
        this.router.navigate(['/sala-espera'],{ queryParams: { code: codigoSala} })
      },
      (error) => {
        console.log(error);
        //this.router.navigate(['/sala-no-existe']);
      }
    );
  }

  listRooms() {
    this.roomService.getRooms().subscribe(
      (response) => {
        console.log(response);
        this.rooms = response; // Almacenar las habitaciones en la variable de componente
      },
      (error) => {
        console.log(error);
      }
    );
  }

  createRoom(server_name:string){
    this.roomService.createRoom(server_name).subscribe(
      (response) => {
        console.log(response);
        response.toString()
        this.router.navigate(['/sala-espera'],{ queryParams: { code: response.toString() } });
      },
      (error) => {
        console.log(error);
        // Aquí puedes manejar el error, como mostrar un mensaje al usuario
      }
    );
  }
}

