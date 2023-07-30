import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { DataService } from 'src/app/utils/data-service/data.service';
import { ModalService } from 'src/app/utils/modal-service/modal.service';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  movimentacoes: Movimentacao[] = [];
  renda: number = 0;
  gastos: number = 0;
  total: number = 0;
  constructor(
    public modalService: ModalService, 
    public dialog: MatDialog,
    private dateService:DataService
  ){}

    async ngOnInit() {
     await this.listarMovimentacoes();
     await this.calcGastos(this.movimentacoes);
     await this.calcRenda(this.movimentacoes);
     this.calcSaldo();
    }
    openDialog() {
      // Open the Material Dialog
      const dialogRef = this.dialog.open(ModalComponent, {
      });

      // Handle dialog close event if needed
      dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed');
      });
    }

    async listarMovimentacoes(): Promise<void> {
      this.movimentacoes = await this.dateService.getAllMovimentacoes();
      const copiaMovimentacoes = [...this.movimentacoes];
      copiaMovimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      this.movimentacoes = copiaMovimentacoes;
      console.log('Movimentações:', this.movimentacoes);
      
    }


    async calcGastos(movimentacoes: Movimentacao[]){
      movimentacoes.forEach(element => {
        if (element.tipo === 'd') {
          this.gastos += parseFloat(element.valor.toString().replace(',', '.'));
        }
      });
    }

    async calcRenda(movimentacoes: Movimentacao[]){
      movimentacoes.forEach(element => {
        if(element.tipo === 'r'){
          this.renda += parseFloat(element.valor.toString().replace(',', '.'));
        }
      });
    }

    calcSaldo(){
      this.total = this.renda - this.gastos;
    }

    formatarValor(valor: number | string): string {
      valor = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
      return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}
