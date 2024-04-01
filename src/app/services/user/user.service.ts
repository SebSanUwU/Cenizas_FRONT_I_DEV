import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserJson } from 'src/app/schemas/UserJson';



@Injectable({
  providedIn: 'root'
})
export class UserService {

  public userUrlApi: string ="http://localhost:8080/v1/users";
  

  constructor(private http: HttpClient) { }

  createUser(apodo: string, correo: string): Observable<any> {
    const params = new HttpParams().set('nickname',apodo).set('mail',correo)
    return this.http.post<any>(this.userUrlApi + "/create", null, {params:params});
  }
  
  getUser(correo:string):Observable<any>{
    return  this.http.get<any>(this.userUrlApi+"/"+correo);
  }

}
