import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageFetcherService {

  errorMessageHandler: Subject<string> = new Subject();

  constructor(
    private httpClient: HttpClient
  ) {}

  fetchImages(requestUrl: string, options: object) {
    return this.httpClient.get(requestUrl, options);
  }

  fetchPreviewImage(requestUrl: string, imageId: string){
    return this.httpClient.get(requestUrl+'/'+imageId);
  }
}