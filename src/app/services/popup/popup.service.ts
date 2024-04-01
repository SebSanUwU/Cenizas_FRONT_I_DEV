import { Injectable, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LogginComponent } from 'src/app/components/loggin/loggin.component';

@Injectable({
  providedIn: 'root',
})
export class PopupService {

  constructor(private dialog: MatDialog) { }

  openPopUp():void{
    //this.dialog.open(LogginComponent);
  }
}
