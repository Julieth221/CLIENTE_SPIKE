import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders  } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";


@Injectable({
    providedIn: 'root'
})

export class ApiService{
    constructor (private http: HttpClient, private authService: AuthService){}

    private getAuthHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        let headers = new HttpHeaders();
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
      }
    
    get<T>(url: string): Observable<T> {
        return this.http.get<T>(url, { headers: this.getAuthHeaders() });
    }

    post<T>(url: string, data: any): Observable<T> {
        return this.http.post<T>(url, data, { headers: this.getAuthHeaders() });
    }

    put<T>(url: string, data: any): Observable<T>{
        return this.http.put<T>(url, data, { headers: this.getAuthHeaders() });
    }

    delete<T>(url:string): Observable<T>{
        return this.http.delete<T>(url, { headers: this.getAuthHeaders() });
    }

}