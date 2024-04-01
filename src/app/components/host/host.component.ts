import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { UserService } from "src/app/services/user/user.service";
// Required for the HTTP GET request to Graph
import { HttpClient } from '@angular/common/http';
import { UserJson } from "src/app/schemas/UserJson";
import { ProfileType } from "src/app/schemas/ProfileTypeJson";
import { use } from "matter";

@Component({
    selector: 'app-host',
    templateUrl: './host.component.html',
    styleUrls: ['./host.component.css', '../../../assets/style/main.css'],
    providers: [UserService]
})
export class HostComponent implements OnInit {
    profileGame!: UserJson;
    tokenExpiration!: string;
    profile!: ProfileType;
    user: any;
    constructor(private userService: UserService, private route: ActivatedRoute, private http: HttpClient) {
    }
    ngOnInit() {
        this.http.get('https://graph.microsoft.com/v1.0/me')
            .subscribe(profile => {
                this.profile = profile;
                if (this.profile && this.profile.mail) {
                    this.user = this.userService.getUser(this.profile.mail);
                }
            });
        this.tokenExpiration = localStorage.getItem('tokenExpiration')!;
        console.log(this.user,this.profile)
    }

}