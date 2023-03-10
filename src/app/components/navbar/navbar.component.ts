import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {

  navMenuOpen: boolean = false;
  @ViewChild('mobileMenu') mobileMenu!: ElementRef;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private viewportScroller: ViewportScroller,
  ) {}

  scrollToElement(elementId: string) {
    this.viewportScroller.scrollToAnchor(elementId);
    if (this.navMenuOpen) {
      this.toggleMenu();
    }
  }

  toggleMenu() {
    this.navMenuOpen = !this.navMenuOpen;
    if (this.navMenuOpen) {
      this.renderer.addClass(this.mobileMenu.nativeElement, 'show-menu');
      this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    } else {
      this.renderer.removeClass(this.mobileMenu.nativeElement, 'show-menu');
      this.renderer.setStyle(this.document.body, 'overflow', 'auto');
    }
  }
}