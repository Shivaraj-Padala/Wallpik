import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageFetcherService {

  constructor(
    private httpClient: HttpClient,
  ) { }

  fetchImages(requestUrl: string, options: object) {
    return this.httpClient.get(requestUrl, options);
  }

  fetchPreviewImage(requestUrl: string, imageId: string){
    return this.httpClient.get(requestUrl+'/'+imageId);
  }
}