import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { DataService } from 'src/app/utils/data-service/data.service';
import { contas } from 'src/app/utils/data/data';
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
  renda_dinheiro:number = 0;
  gastos_dinheiro:number = 0;
  renda_refeicao: number = 0;
  gastos_refeicao: number = 0;
  total_dinheiro: number = 0;
  rendas_contas: number[] = [];
  gastos_contas: number[] = [];
  totais_contas: number[] = [];
  contas: any;
  constructor(
    public modalService: ModalService, 
    public dialog: MatDialog,
    private dataService:DataService,
    private commonService: CommonService
  ){}

    async ngOnInit() {
      this.contas = contas;
      await this.listarMovimentacoes();
      await this.calcGastos(this.movimentacoes);
      await this.calcRenda(this.movimentacoes);
      await this.calcPorConta(this.movimentacoes);
      this.calcSaldo();
    }
    openInsertModal() {
      // Open the Material Dialog
      const dialogRef = this.dialog.open(ModalComponent, {
        data: {
          isEditMode: false
        }
      });

      // Handle dialog close event if needed
      dialogRef.afterClosed().subscribe((result) => {
      });
    }


    openEditModal(movimentacao: Movimentacao): void {
      const dialogRef = this.dialog.open(ModalComponent, {
        // Outras configurações do dialog
        data: {
          movimentacao,
          isEditMode: true
        }
      });
    }

    async listarMovimentacoes(): Promise<void> {
      this.movimentacoes = await this.dataService.getAllMovimentacoes();
      const copiaMovimentacoes = [...this.movimentacoes];
      copiaMovimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      this.movimentacoes = copiaMovimentacoes;
      
    }

    async deleteMovimentacao(id: number | undefined): Promise<void> {
      if (typeof id === 'number') {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          data: {
            message: 'Tem certeza que deseja excluir esta movimentação?',
            confirmText: 'Confirmar',
            cancelText: 'Cancelar'
          }
        });
    
        dialogRef.afterClosed().subscribe((result: boolean) => {
          if (result === true) {
            // Usuário confirmou a exclusão, chama a função deleteMovimentacao
            this.dataService.deleteMovimentacao(id).then(() => {
              window.location.reload();
            });
          } else {
            // Usuário cancelou a exclusão
          }
        });
        
      } else {
        console.error('ID inválido. A movimentação precisa ter um ID válido para ser excluída.');
        // Exibir uma mensagem de erro ou lidar com a situação de ID inválido.
      }
    }


    async calcGastos(movimentacoes: Movimentacao[]){
      movimentacoes.forEach(element => {
        if (element.tipo === 'd') {
          this.gastos += parseFloat(element.valor.toString().replace(',', '.'));
          if(element.pagamento === 'c' || element.pagamento === 'd' || element.pagamento === 'p'){
            this.gastos_dinheiro += parseFloat(element.valor.toString().replace(',', '.'));
          }
          else if(element.pagamento === 'r'){
            this.gastos_refeicao += parseFloat(element.valor.toString().replace(',', '.'));
          }
        }
      });
    }

    async calcPorConta(movimentacoes: Movimentacao[]){
      this.contas.forEach((conta:any) =>{
        let gastos = 0;
        let renda = 0;
        let total = 0;
        movimentacoes.forEach(mov => {
          if (mov.conta === conta.id) {
            if((mov.tipo === 'r') && (mov.pagamento === 'c' || mov.pagamento === 'd' || mov.pagamento === 'p')){
              renda += parseFloat(mov.valor.toString().replace(',', '.'));
            }
            else if((mov.tipo === 'd') && (mov.pagamento === 'c' || mov.pagamento === 'd' || mov.pagamento === 'p')){
              gastos += parseFloat(mov.valor.toString().replace(',', '.'));
            }
          }
      });
      total = renda - gastos;
      this.rendas_contas.push(renda);
      this.gastos_contas.push(gastos);
      this.totais_contas.push(total);
    });
  }

    async calcRenda(movimentacoes: Movimentacao[]){
      movimentacoes.forEach(element => {
        if(element.tipo === 'r'){
          this.renda += parseFloat(element.valor.toString().replace(',', '.'));
          if(element.pagamento === 'c' || element.pagamento === 'd' || element.pagamento === 'p'){
            this.renda_dinheiro += parseFloat(element.valor.toString().replace(',', '.'));
          }
          else if(element.pagamento === 'r'){
            this.renda_refeicao += parseFloat(element.valor.toString().replace(',', '.'));
          }
        }
      });
    }

    calcSaldo(){
      this.total = this.renda - this.gastos;
      this.total_dinheiro = this.renda_dinheiro - this.gastos_dinheiro;
      this.renda_refeicao = this.renda_refeicao - this.gastos_refeicao;
    }

    formatarValor(valor: number | string): string{
      return this.commonService.formatarValor(valor);
    }
    
}
