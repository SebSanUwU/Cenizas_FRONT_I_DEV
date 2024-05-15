import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomsService } from '../../services/rooms/rooms.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['../../../assets/style/main.css']
})
export class HomeComponent implements OnInit{

  constructor(private router: Router, private roomService:RoomsService, private http: HttpClient){}


  ngOnInit(): void {
    // Aqui pondria mi codigo SI TUVIERA UNO 
  }
}
