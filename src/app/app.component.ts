import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from './utils/data-service/data.service';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'finance';
  movimentacoes: any[] = [];
  isMenuOpen = false;
  @ViewChild('drawer') drawer!: MatDrawer;
  @ViewChild('drawerButton') drawerButton!: any; // Use o tipo apropriado para o seu botão
  selectedMovimentacao: any = null;
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
  }


  toggleDrawer() {
    this.drawer.toggle();
    this.isMenuOpen = this.drawer.opened;
  }

  
}
