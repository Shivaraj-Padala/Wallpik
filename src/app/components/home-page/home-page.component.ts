import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageFetcherService } from 'src/app/services/image-fetcher.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-main-layout',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})

export class HomePageComponent implements AfterViewInit, OnInit {

  @ViewChild('notification') notification!: ElementRef<HTMLElement>;
  @ViewChild('bottomBar') bottomBar!: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('imageCard') imageCard!: QueryList<ElementRef>;

  searchForm!: FormGroup;
  searchPlaceHolder = 'Search for photos, wallpapers';
  apiUrl: string = environment.apiUrl;
  downloadUrl: string = environment.downloadUrl;
  pageCounter: number = 1;
  searchTerm!: string;
  errorMsg!: string;
  errorSound!: any;
  imageDialogOpened: boolean = false;
  previewImage!: string;
  previewImageId!: string;
  previewImageData!: any;
  previewLoaded: boolean = false;
  deviceOnlineStatus!: string;
  cardPreloaderHeight!: string;
  imagesList: any = [];
  imagesLoadedList = new Map();

  defaultOptions = {
    params: { page: this.pageCounter, per_page: 18 }
  };

  searchOptions = {
    params: { query: this.searchTerm, page: this.pageCounter, per_page: 18 }
  };

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private imageFetcher: ImageFetcherService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    if (window.innerWidth < 768) {
      this.searchPlaceHolder = 'Search for wallpapers';
    }
    this.loadAudio();
    this.subscribeQueryParams();

    this.imageFetcher.errorMessageHandler.subscribe(errorMsg => {
      this.errorMsg = errorMsg;
      this.showNotification();
    })
  }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      search: ['', [
        Validators.required,
        Validators.pattern('(.|\\s)*\\S(.|\\s)*')
      ]],
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.cardPreloaderHeight = `${this.imageCard.first.nativeElement.offsetHeight}px`;
  }

  @HostListener('window:online', ['$event'])
  onOnline(){
    this.deviceOnlineStatus = 'Online';
    navigator.vibrate([200]);
  }

  @HostListener('window:offline', ['$event'])
  onOffline(){
    this.deviceOnlineStatus = 'Offline';
    this.renderer.setStyle(this.bottomBar.nativeElement, 'display', 'grid');
    setTimeout(() =>{
      navigator.vibrate([200]);
    }, 1000)
  }

  loadAudio() {
    this.errorSound = new Audio();
    this.errorSound.src = './assets/sounds/error.mp3';
    this.errorSound.load();
  }

  subscribeQueryParams() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['previewImage']) {
        this.previewImageId = params['previewImage'];
        this.openImageDialog();
      } else {
        if (this.imageDialogOpened) {
          this.closeImageDialog();
        }
      }
    })
  }

  getPreviewImage(img: any) {
    this.previewImageData = img;
    this.router.navigate([],
      {
        queryParams: {
          previewImage: img.id
        },
        queryParamsHandling: 'merge'
      }
    )
  }

  openImageDialog() {
    if (this.previewImageData) {
      this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
      this.imageDialogOpened = !this.imageDialogOpened;
      this.previewImage = this.previewImageData.src.original;
      this.previewImageId = this.previewImageData.id;
    } else {
      this.imageFetcher.fetchPreviewImage(environment.previewUrl, this.previewImageId).subscribe((previewImgData: any) => {
        this.previewImageData = previewImgData;
        if (this.previewImageData) {
          this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
          this.imageDialogOpened = !this.imageDialogOpened;
          this.previewImage = this.previewImageData.src.original;
          this.previewImageId = this.previewImageData.id;
        }
      })
    }
  }

  closeImageDialog() {
    this.renderer.setStyle(this.document.body, 'overflow', 'auto');
    this.imageDialogOpened = !this.imageDialogOpened;
    this.previewLoaded = false;
    this.previewImageId = '';
    this.previewImageData = undefined;
  }

  getImages(requestUrl: string, requestOptions: any, loadMoreReq: boolean) {
    this.imageFetcher.fetchImages(requestUrl, requestOptions).subscribe((imagesData: any) => {
      if (imagesData.photos.length == 0) {
        this.imagesList = [];
        this.imagesLoadedList.clear();
        this.errorMsg = "We couldn't find anything";
        this.showNotification();
      } else {
        if (loadMoreReq) {
          this.imagesList = [...this.imagesList, ...imagesData.photos];
          imagesData.photos.forEach((thumbnailImage: any) => {
            this.imagesLoadedList.set(thumbnailImage.src.portrait, false);
          });
        } else {
          this.imagesList = [...imagesData.photos];
          this.imagesLoadedList.clear();
          this.imagesList.forEach((thumbnailImage: any) => {
            this.imagesLoadedList.set(thumbnailImage.src.portrait, false);
          });
        }
        if (this.searchTerm && loadMoreReq == false) {
          window.scrollTo(0, window.innerHeight);
        }
      }
    })
  }

  onThumbnailLoad(thumbnailImage: string) {
    this.imagesLoadedList.set(thumbnailImage, true);
    this.cardPreloaderHeight = `${this.imageCard.first.nativeElement.offsetHeight}px`;
  }

  validateSearch(): boolean {
    if (this.searchForm.get('search')?.errors?.['required']) {
      this.errorMsg = "Search can't be empty";
      this.showNotification();
      return false;
    }

    if (this.searchForm.get('search')?.errors?.['pattern']) {
      this.errorMsg = "Search can't be empty";
      this.showNotification();
      return false;
    }

    this.searchTerm = this.searchForm.get('search')?.value;
    return true;
  }

  searchImages() {
    this.searchInput.nativeElement.blur();
    if (this.validateSearch()) {
      this.pageCounter = 1;
      this.searchOptions.params.query = this.searchTerm;
      this.searchOptions.params.page = this.pageCounter;
      this.getImages(`${this.apiUrl}/search`, this.searchOptions, false);
    }
  }

  showNotification() {
    this.renderer.setStyle(this.notification.nativeElement, 'top', '13%');
    this.errorSound.play();
    setTimeout(() => {
      this.renderer.setStyle(this.notification.nativeElement, 'top', '-50%');
    }, 2000)
  }

  loadMore() {
    this.pageCounter += 1;
    if (this.searchTerm) {
      this.searchOptions.params.page = this.pageCounter;
      this.getImages(`${this.apiUrl}/search`, this.searchOptions, true);
    } else {
      this.defaultOptions.params.page = this.pageCounter;
      this.getImages(`${this.apiUrl}/curated`, this.defaultOptions, true);
    }
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }

  ngAfterViewInit(): void {
    this.getImages(`${this.apiUrl}/curated`, this.defaultOptions, false);
  }

}