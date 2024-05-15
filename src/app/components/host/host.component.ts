import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { UserService } from "src/app/services/user/user.service";
import { ProfileType } from "src/app/schemas/ProfileTypeJson";
import { RoomsService } from "src/app/services/rooms/rooms.service";
import { UserJson } from "src/app/schemas/UserJson";

import { HttpClient } from '@angular/common/http';
import { RoomJson } from "src/app/schemas/RoomJson";


@Component({
    selector: 'app-host',
    templateUrl: './host.component.html',
    styleUrls: ['./host.component.css', '../../../assets/style/main.css'],
    providers: [UserService, RoomsService]
})
export class HostComponent implements OnInit {
    tokenExpiration!: string;
    profile!: ProfileType;
    user!: UserJson;
    server_name: string = '';
    rooms!: [string];
    roomsInfo: RoomJson[] = [];
    roomType: string = 'public';
    nickname!: string;
    MAX_ROOM: number = 3;
    full: boolean = false;
    onDelete: boolean = false;

    constructor(private userService: UserService, private roomService: RoomsService, private router: Router, private http: HttpClient) {
    }
    ngOnInit() {
        this.http.get('https://graph.microsoft.com/v1.0/me')
            .subscribe(profile => {
                this.profile = profile;
                if (this.profile?.mail && this.profile?.displayName) {
                    this.nickname = this.profile.displayName;
                    this.bringUserInfo(this.profile.mail)
                    this.bringUserRooms(this.profile.mail)
                }
            });

    }

    createRoom(server_name: string) {
        const type = this.roomType === "public";
        const user = this.user.mail;
        this.roomService.createRoom(server_name, type, user).subscribe({
            next: (response) => {
                this.router.navigate(['/sala-espera'], { queryParams: { code: response.toString() } })
            },
            error: (error) => console.log(error),
            complete: () => console.info('complete')
        });
    }

    startGame(code: string) {
        if(!this.onDelete){
            this.router.navigate(['/lobby'], { queryParams: { code: code } });
        }
    }

    editMode() {
        this.onDelete = !this.onDelete;
    }

    
    deleteUserRoom(code:string){
        this.roomService.deleteRoom(code).subscribe({
            next:() => console.log("Eliminar Sala"),
            error: (error) => console.log(error),
            complete: () => console.info('Eliminacion de sala completa')
        })
        this.userService.deleteUserRoom(this.user.mail,code).subscribe({
            next:() => this.bringUserRooms(this.user.mail),
            error: (error) => console.log(error),
            complete: () => console.info('Eliminacion de sala en usuario completa')
        })
    }

    bringUserInfo(mail: string) {
        this.userService.getUser(mail).subscribe({
            next: (response) => {
                this.user = response
            },
            error: (error) => console.log(error),
            complete: () => console.info('Traer al usuario exitoso')
        })
    }

    bringUserRooms(mail: string) {
        this.userService.getUserRooms(mail).subscribe({
            next: (response) => {
                this.rooms = response;
                console.log(this.rooms);

                // Inicializa el array roomsInfo para almacenar la información detallada de las habitaciones
                this.roomsInfo = [];

                // Por cada ID de habitación, obtener la información detallada
                this.rooms.forEach(roomId => {
                    this.roomService.getRoom(roomId).subscribe({
                        next: (room) => {
                            this.roomsInfo.push(room); // Agrega la información de la habitación al array roomsInfo
                            if (this.roomsInfo.length >= this.MAX_ROOM) {
                                this.full = true;
                            }else{
                                this.full = false;
                            }
                        },
                        error: (error) => console.error('Error al obtener la información de la habitación:', error),
                        complete: () => console.info('Obtención de información de la habitación completa')
                    });
                });
            },
            error: (error) => console.error('Error al obtener las habitaciones del usuario:', error),
            complete: () => console.info('Obtención de habitaciones del usuario completa')
        });
    }

}