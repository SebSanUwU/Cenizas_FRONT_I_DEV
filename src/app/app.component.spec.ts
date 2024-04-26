import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // Importa RouterTestingModule
import { AppComponent } from './app.component';
import { MsalGuardConfiguration, MSAL_GUARD_CONFIG, MsalService, MSAL_INSTANCE, MsalBroadcastService } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpClientTestingModule;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule // Importa RouterTestingModule aquí
      ],
      declarations: [AppComponent],
      providers: [
        MsalBroadcastService,
        MsalService,
        {
          provide: MSAL_GUARD_CONFIG,
          useValue: {
            interactionType: 'redirect',
            authRequest: {
              clientId: "c6a90014-e04a-4490-a744-60a1cf8e32ff",
              authority: "https://login.microsoftonline.com/9c3dde60-b813-4c66-870f-04e975f8171f",
              redirectUri: environment.homeLink,
            } // Proporciona aquí las configuraciones necesarias para MSAL_GUARD_CONFIG
          } as MsalGuardConfiguration
        },
        {
          provide: MSAL_INSTANCE,
          useFactory: () => {
            return new PublicClientApplication({
              auth: {
                clientId: 'c6a90014-e04a-4490-a744-60a1cf8e32ff'
              }
            });
          }
        }
      ]
    })
      .compileComponents();
      httpMock = TestBed.inject(HttpClientTestingModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


