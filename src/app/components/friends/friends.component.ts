import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { UserService } from "src/app/services/user/user.service";
import { HttpClient } from '@angular/common/http';
import { ProfileType } from "src/app/schemas/ProfileTypeJson";
import { UserJson } from "src/app/schemas/UserJson";
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { FriendRequest } from "src/app/schemas/FriendRequest";

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['../../../assets/style/main.css']
})
export class FriendsComponent implements OnInit {
    socket = io(environment.socketLink);
    profile!: ProfileType;
    user!: UserJson;
    nickname!: string;
    friendMail: string = "";
    sentList: FriendRequest[] = [];
    receivedList: FriendRequest[] = [];
    showError: boolean = false;
    friends: string[] = [];

    constructor(private userService: UserService, private router: Router, private http: HttpClient) { }

    ngOnInit(): void {
        this.socket.connect();
    
        this.socket.on('connect', () => {
            this.http.get('https://graph.microsoft.com/v1.0/me').subscribe(
                (profile: any) => {
                    this.profile = profile;
                    if (this.profile?.mail && this.profile?.displayName) {
                        this.nickname = this.profile.displayName;
                        const userEmail = this.profile.mail;
                        this.processUserData(userEmail);
                    }
                },
                (error: any) => {
                    console.error('Error al obtener el perfil del usuario:', error);
                }
            );
        });
        this.socket.on('friendRequestReceived', (data) => {
            // Lógica para manejar la solicitud de amistad recibida
            console.log(`El usuario con correo electrónico ${data} te envio una solicitud.`);
            this.bringFriendRequestReceived(this.user.mail)
        })
        this.socket.on('friendRequestRespond', (data) => {
            // Lógica para manejar la solicitud de amistad recibida
            console.log(`Respuesta ${data}`);
            if (data == 'accepted') {
                this.bringUserFriends(this.user.mail)
            }
            this.bringPendingSendFriendRequest(this.user.mail)
        })
    }
    
    processUserData(userEmail: string): void {
        this.bringUserInfo(userEmail);
        this.socket.emit('registPlayer', { user: userEmail, id: this.socket.id });
        this.bringPendingSendFriendRequest(userEmail);
        this.bringFriendRequestReceived(userEmail);
        this.bringUserFriends(userEmail);
    }
    

    sendFriendRequest(correo: string) {
        if (correo == this.user.mail) {
            this.showError = true
        } else {
            this.userService.sendFriendRequest(this.user.mail, correo).subscribe({
                next: () => {
                    this.socket.emit('sendFriendRequest', ({ send: this.user.mail, reciever: correo }))
                    this.showError = false
                    this.bringPendingSendFriendRequest(this.user.mail)
                },
                error: (error) => {
                    console.error('Error al enviar la solicitud de amistad:', error);
                    // Mostrar un mensaje de error al usuario
                    this.showError = true
                },
                complete: () => console.info('Send Friend Request complete')
            })
        }
    }

    respondToFriendRequest(correo: string, respond: string) {
        this.userService.respondFriendReques(this.user.mail, correo, respond).subscribe({
            next: () => {
                this.socket.emit('respondRequest', ({ reciever: this.user.mail, send: correo, respond: respond }))
                if (respond == 'accepted') {
                    this.bringUserFriends(this.user.mail)    
                }
                this.bringFriendRequestReceived(this.user.mail)
            },
            error: (error) => {
                console.error('Error al enviar la solicitud de amistad:', error);
                // Mostrar un mensaje de error al usuario
                this.showError = true
            },
            complete: () => console.info('Respond To FriendRequest complete')
        })
        
    }

    bringUserFriends(mail: string) {
        this.userService.getUserFriends(mail).subscribe({
            next: (response) => {
                this.friends = response
            },
            error: (error) => console.log(error),
            complete: () => console.info('Traer Amigos completo')
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

    bringPendingSendFriendRequest(mail: string) {
        this.userService.getFriendRequestSent(mail).subscribe({
            next: (response) => {
                console.log(response)
                this.sentList = response
            },
            error: (error) => console.log(error),
            complete: () => console.info('Traer lista de solicitudes enviadas completado')
        })
    }

    bringFriendRequestReceived(mail: string) {
        this.userService.getFriendRequestRecieved(mail).subscribe({
            next: (response) => {
                this.receivedList = response
            },
            error: (error) => console.log(error),
            complete: () => console.info('Traer lista de solicitudes recibidas completado')
        })
    }
}