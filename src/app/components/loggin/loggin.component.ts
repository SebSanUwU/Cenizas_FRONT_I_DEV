import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult, InteractionStatus,RedirectRequest } from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';

import { UserService } from 'src/app/services/user/user.service';



@Component({
  selector: 'app-loggin',
  templateUrl: './loggin.component.html',
  styleUrls: ['./loggin.component.css']
})
export class LogginComponent implements OnInit, OnDestroy{
  title = 'msal-angular-tutorial';
  isIframe = false;
  loginDisplay = false;
  mail : string = "";
  nickname : string = "";
  
  tokenExpiration: string = '';
  private readonly _destroying$ = new Subject<void>();
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    
  }


  createCount(){
    this.authService.loginPopup()
      .subscribe({
        next: (result: AuthenticationResult) => {
          if (result.account && result.account.name && result.account.username) {
            this.mail = result.account.username;
            this.nickname = result.account.name;
            this.userService.createUser(this.mail,this.nickname).subscribe((resultado => {
              console.log("Se inicio sesion");
            }));
          }
        },
        error: (error) => console.log(error)
      });
  }
  
}