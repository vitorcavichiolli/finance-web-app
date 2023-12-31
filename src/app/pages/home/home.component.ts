import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { LoginComponent } from 'src/app/components/login/login.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { API_DELETE_MOVIMENTACAO, API_LISTAGEM_MOVIMENTACOES } from 'src/app/utils/api/api';
import { BackService } from 'src/app/utils/back-service/back.service';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { DataService } from 'src/app/utils/data-service/data.service';
import { contas } from 'src/app/utils/data/data';
import { LoadingService } from 'src/app/utils/loading-service/loading.service';
import { ModalService } from 'src/app/utils/modal-service/modal.service';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { ItemPlanejamento, Planejamento } from 'src/app/utils/models/planejamentos.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  movimentacoes: Movimentacao[] = [];
  movimentacoes_ate_data_atual: Movimentacao[] = [];
  movimentacoes_ate_mes_atual: Movimentacao[] = [];
  renda: number = 0;
  gastos: number = 0;
  total: number = 0;
  renda_dinheiro:number = 0;
  gastos_dinheiro:number = 0;
  renda_dinheiro_mes:number = 0;
  gastos_dinheiro_mes:number = 0;
  renda_refeicao: number = 0;
  gastos_refeicao: number = 0;
  total_dinheiro: number = 0;
  total_dinheiro_mes: number = 0;
  rendas_contas: number[] = [];
  gastos_contas: number[] = [];
  totais_contas: number[] = [];
  contas: any;
  ultimasMovimentacoes: Movimentacao[] = [];
  notificacoes:{ planejamento: Planejamento, itens: ItemPlanejamento[] }[] =[];
  selectedPlanejamento: { planejamento: Planejamento, itens: any[] } | null = null;

  constructor(
    public modalService: ModalService, 
    public dialog: MatDialog,
    private dataService:DataService,
    private commonService: CommonService,
    private backService: BackService,
    public loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ){}

    async ngOnInit() {
      await this.verificaToken();
    }
    async verificaToken() {
      if (sessionStorage.getItem('token')) {
        this.contas = contas;
        this.cdr.detectChanges();
        this.loadingService.openLoading();
          await this.listarMovimentacoes();
          await this.calcGastos(this.movimentacoes_ate_data_atual, this.movimentacoes_ate_mes_atual);
          await this.calcRenda(this.movimentacoes_ate_data_atual, this.movimentacoes_ate_mes_atual);
          await this.calcPorConta(this.movimentacoes_ate_data_atual);
          this.calcSaldo();
          this.backService.notificacoesAtualizadas.subscribe(() => {
            this.notificacoes = this.backService.getPlanejamentosComprometidos();
          });
          this.loadingService.closeLoading();
      }
    }
    
   
  onNotificationSelect(notification: {
    planejamento: Planejamento;
    itens: ItemPlanejamento[];
  }): void {
    this.selectedPlanejamento = notification;
    this.modalService.openModal();
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
      try {
        const result = await this.commonService.getApi<Movimentacao[]>(API_LISTAGEM_MOVIMENTACOES).toPromise();
        if (result !== undefined) {
          this.movimentacoes = result;
          // Filtrar as movimentações até a data atual
          const dataAtual = new Date();
          this.movimentacoes_ate_data_atual = this.movimentacoes.filter(movimentacao => new Date(movimentacao.data) <= dataAtual);
          this.movimentacoes_ate_mes_atual = this.filterMovimentacoesAteMesAtual(this.movimentacoes);

        }        
        const copiaMovimentacoes = [...this.movimentacoes];
        // copiaMovimentacoes.sort((a, b) => {
        //   const dateComparison = new Date(b.data).getTime() - new Date(a.data).getTime();
        //   if (dateComparison === 0) {
        //     if(b.id && a.id)
        //     return b.id - a.id;
        //     return dateComparison;
        //   } else {
        //     return dateComparison;
        //   }
        // });
        copiaMovimentacoes.sort((a, b) => {
          if (b.id && a.id) {
            return b.id - a.id; // Ordenar em ordem decrescente
          } else {
            return 0;
          }
        });
        this.movimentacoes = copiaMovimentacoes;
        this.ultimasMovimentacoes =  copiaMovimentacoes.slice(0, 50);

      } catch (error) {
        console.error('Erro ao listar movimentações:', error);
      }
    }
    filterMovimentacoesAteMesAtual(movimentacoes: Movimentacao[]): Movimentacao[] {
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth() + 1; // Mês atual começa de 0
      const anoAtual = dataAtual.getFullYear();
    
      return movimentacoes.filter(movimentacao => {
        const dataMovimentacao = new Date(movimentacao.data);
        const mesMovimentacao = dataMovimentacao.getMonth() + 1;
        const anoMovimentacao = dataMovimentacao.getFullYear();
        
        return anoMovimentacao <= anoAtual && mesMovimentacao <= mesAtual;
      });
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
            const body = parseInt(id.toString());
            this.commonService.deleteApi<any>(API_DELETE_MOVIMENTACAO, body).subscribe(
              response => {
                window.location.reload();
              },
              error => {
                console.error('Error deleting item', error);
              }
            );
          } else {
          }
        });
        
      } else {
        console.error('ID inválido. A movimentação precisa ter um ID válido para ser excluída.');
      }
    }


    async calcGastos(movimentacoes: Movimentacao[], movimentacoes_mes: Movimentacao[]){

      movimentacoes.forEach(element => {
        if (element.tipo === 'd') {
          if(element.pagamento === 'c' || element.pagamento === 'd' || element.pagamento === 'p'){
            
            if(element.categoria == 18){
              this.renda_dinheiro -= parseFloat(element.valor.toString().replace(',', '.'));
              this.renda -= parseFloat(element.valor.toString().replace(',', '.'));

            }
            else{
              this.gastos_dinheiro += parseFloat(element.valor.toString().replace(',', '.'));
              this.gastos += parseFloat(element.valor.toString().replace(',', '.'));

            }
          }
          else if(element.pagamento === 'r'){
            this.gastos_refeicao += parseFloat(element.valor.toString().replace(',', '.'));
          }
        }
      });
      movimentacoes_mes.forEach(element => {
        if (element.tipo === 'd') {
          if(element.pagamento === 'c' || element.pagamento === 'd' || element.pagamento === 'p'){
            if(element.categoria == 18){
              this.renda_dinheiro_mes -= parseFloat(element.valor.toString().replace(',', '.'));
            }
            else{
              this.gastos_dinheiro_mes += parseFloat(element.valor.toString().replace(',', '.'));
            }
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
              if(mov.categoria == 18){
                renda -= parseFloat(mov.valor.toString().replace(',', '.'));
              }
              else{
                gastos += parseFloat(mov.valor.toString().replace(',', '.'));
              }
            }
          }
      });
      total = renda - gastos;
      this.rendas_contas.push(renda);
      this.gastos_contas.push(gastos);
      this.totais_contas.push(total);
    });

  }

    async calcRenda(movimentacoes: Movimentacao[], movimentacoes_mes: Movimentacao[]){

      movimentacoes.forEach(element => {
        if(element.tipo === 'r'){
          if((element.pagamento === 'c' || element.pagamento === 'd' || element.pagamento === 'p') && element.conta != 'p'){
            this.renda_dinheiro += parseFloat(element.valor.toString().replace(',', '.'));
            this.renda += parseFloat(element.valor.toString().replace(',', '.'));

          }

          else if(element.pagamento === 'r'){
            this.renda_refeicao += parseFloat(element.valor.toString().replace(',', '.'));
          }
        }
      });
      movimentacoes_mes.forEach(element => {
        if(element.tipo === 'r'){
          if(element.pagamento === 'c' || element.pagamento === 'd' || element.pagamento === 'p' && element.conta != 'p'){
            this.renda_dinheiro_mes += parseFloat(element.valor.toString().replace(',', '.'));
          }
        }
      });

    }

    calcSaldo(){
      this.total = this.renda - this.gastos;
      this.total_dinheiro_mes = this.renda_dinheiro_mes - this.gastos_dinheiro_mes;
      this.total_dinheiro = this.renda_dinheiro - this.gastos_dinheiro;
      this.renda_refeicao = this.renda_refeicao - this.gastos_refeicao;
    }

    formatarValor(valor: number | string): string{
      return this.commonService.formatarValor(valor);
    }
    
    async onPlanejamentoSelect(planejamento: { planejamento: Planejamento, itens: any[] }): Promise<void> {
      try {
        // Chame o método getPlanejamentoWithItems() do serviço para obter o planejamento e seus itens
        this.selectedPlanejamento = planejamento;
        this.modalService.openModal();
      } catch (error) {
        console.error('Error fetching planejamento with items:', error);
      }
    }
}
