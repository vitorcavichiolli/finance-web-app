import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private isMenuOpen = true; // Defina o valor inicial do menu como aberto

  isMenuOpened(): boolean {
    return this.isMenuOpen;
  }

  setMenuState(isOpened: boolean): void {
    this.isMenuOpen = isOpened;
  }
}
