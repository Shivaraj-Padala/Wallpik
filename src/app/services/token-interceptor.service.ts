import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environment/environment';
import { ImageFetcherService } from './image-fetcher.service';

@Injectable({
  providedIn: 'root'
})

export class TokenInterceptorService implements HttpInterceptor {
  constructor(
    private imageFetcherService: ImageFetcherService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokenizedRequest = req.clone(
      {
        setHeaders: {
          Authorization: environment.authorizationHeader
        }
      }
    );
    return next.handle(tokenizedRequest).pipe(catchError((error: HttpErrorResponse) => {
      return throwError(() => {
        if (error.status == 404) {
          this.imageFetcherService.errorMessageHandler.next('Image not found');
          return new Error('Image not found');
        }
        this.imageFetcherService.errorMessageHandler.next('Something went wrong');
        return new Error('Something went wrong');
      })
    }));
  }
}