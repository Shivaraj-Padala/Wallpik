import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})

export class TokenInterceptorService implements HttpInterceptor{

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokenizedRequest = req.clone(
      {
        setHeaders: {
          Authorization : environment.authorizationHeader
        }
      }
    );
    return next.handle(tokenizedRequest);
  }
}