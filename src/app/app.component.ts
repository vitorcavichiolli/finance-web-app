import { Component, OnInit } from '@angular/core';
import { DataService } from './utils/data-service/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'finance';
  movimentacoes: any[] = [];
  selectedMovimentacao: any = null;
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
  }

 
}
