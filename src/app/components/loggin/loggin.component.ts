import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { UserService } from "src/app/services/user/user.service";
// Required for the HTTP GET request to Graph
import { HttpClient } from '@angular/common/http';
import { UserJson } from "src/app/schemas/UserJson";
import { ProfileType } from "src/app/schemas/ProfileTypeJson";

@Component({
  selector: 'app-host',
  templateUrl: './loggin.component.html',
  styleUrls: ['./loggin.component.css', '../../../assets/style/main.css'],
  providers: [UserService]
})
export class LogginComponent implements OnInit {
  profileGame!: UserJson;
  tokenExpiration!: string;
  profile!: ProfileType;
  user!: UserJson;
  friendMail: string = "";
  friends: string[] = [];
  rooms: number[] = [];
  constructor(private userService: UserService, private route: ActivatedRoute, private http: HttpClient) {
  }
  ngOnInit() {
    this.http.get('https://graph.microsoft.com/v1.0/me')
      .subscribe(profile => {
        this.profile = profile;
        if (this.profile?.mail) {
          this.userService.getUser(this.profile.mail).subscribe((user: UserJson) => {
            this.user = user;
            this.tokenExpiration = localStorage.getItem('tokenExpiration')!;
            this.friends = this.user.friends;
            this.rooms = this.user.rooms;
          });
        }
      });
  }
}