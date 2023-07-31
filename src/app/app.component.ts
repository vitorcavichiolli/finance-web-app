import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from './utils/data-service/data.service';
import { MatDrawer } from '@angular/material/sidenav';
import { MenuService } from './utils/menu-service/menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit  {
  title = 'finance';
  movimentacoes: any[] = [];
  isMenuOpen = false;
  @ViewChild('drawer') drawer!: MatDrawer;
  @ViewChild('drawerButton') drawerButton!: any; // Use o tipo apropriado para o seu botão
  selectedMovimentacao: any = null;
  isMenuOpened = false; // Inicialmente, o menu estará fechado
  icon = 'chevron_right'; 
  constructor(
    private dataService: DataService,
    public menuService: MenuService) {}

    
    ngAfterViewInit() {
      this.isMenuOpened = this.menuService.isMenuOpened();
      this.drawer.opened = this.isMenuOpened;
      this.icon = this.isMenuOpened ? 'chevron_left' : 'chevron_right'; // Defina o ícone com base no estado do menu
    }
  
    toggleDrawer() {
      this.drawer.toggle();
      this.isMenuOpened = !this.isMenuOpened;
      this.icon = this.isMenuOpened ? 'chevron_left' : 'chevron_right'; // Atualize o ícone ao alternar o menu
      this.menuService.setMenuState(this.isMenuOpened);
    }
  
}
