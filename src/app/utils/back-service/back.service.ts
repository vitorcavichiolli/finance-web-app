import { Injectable, OnInit, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { DataService } from '../data-service/data.service';
import { PlanningDataService } from '../planning-data-service/planning-data.service';
import { CommonService } from '../common-service/common.service';
import { Movimentacao } from '../models/movimentacao.model';
import { ItemPlanejamento, Planejamento } from '../models/planejamentos.model';
import { EventEmitter } from '@angular/core';
import { API_DELETE_RECORRENCIA, API_INSERT_MOVIMENTACAO, API_LISTAGEM_MOVIMENTACAO, API_LISTAGEM_MOVIMENTACOES, API_LISTAGEM_PLANEJAMENTOS_BY_DATAFINAL, API_LISTAGEM_RECORRENCIAS, API_UPDATE_RECORRENCIA } from '../api/api';
import { Recorrencia } from '../models/recorrencia.model';
import { LoginComponent } from 'src/app/components/login/login.component';
import { MatDialog } from '@angular/material/dialog';
import { isSameDay  } from 'date-fns';
import { CdiService } from '../cdi-service/cdi.service';

@Injectable({
  providedIn: 'root'
})
export class BackService  {
  private taskSubscription: Subscription | undefined;
  private movimentacoes: Movimentacao[] = [];
  private recorrencias: Recorrencia[] = [];
  private planejamentos: { planejamento: Planejamento, itens: ItemPlanejamento[] }[] = [];
  private planejamentosComprometidos: { planejamento: Planejamento, itens: ItemPlanejamento[] }[] = [];
  @Output() notificacoesAtualizadas: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private commonService: CommonService,
    public dialog: MatDialog,
    private cdiService: CdiService
  ) { }

  async startBackgroundTask(): Promise<void> {
    this.verificaToken();
  }

  stopBackgroundTask(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
      this.taskSubscription = undefined;
    }
  }

  verificaToken(){
    if(!sessionStorage.getItem('token')){
        // Open the Material Dialog
        const dialogRef = this.dialog.open(LoginComponent, {
        });
    
        // Handle dialog close event if needed
        dialogRef.afterClosed().subscribe((result) => {
        });
      
    }
    else{
      this.taskSubscription = interval(10000).subscribe(async () => {
        await this.listarMovimentacoes();
        await this.listarPlanejamentos();
        await this.listarRecorrencias();
        await this.performBackgroundTask();
      });
    }
  }

  private async performBackgroundTask(): Promise<void> {
    this.planejamentosComprometidos = await this.verificarPlanejamentos();
    this.notificacoesAtualizadas.emit();
    await this.verificarRecorrencias(this.recorrencias);
  }

  private async verificarRecorrencias(recorrencias: Recorrencia[]){
    if(recorrencias.length > 0 ){
      const dataAtual = new Date();
      recorrencias.forEach(async el => {
        let movimentacao = await this.getMovimentacao(el.id_movimentacao);
        const data_movimentacao = new Date(movimentacao.data);
        if(dataAtual.getDate() >= data_movimentacao.getDate() && this.compareDatesWithoutTime(dataAtual, data_movimentacao) == 1){
          movimentacao.recorrencia = false;
          movimentacao.descricao = movimentacao.descricao + " [RECORRÊNCIA ID: " + el.id +"]"; 
          const day = data_movimentacao.getDate();
          movimentacao.data = new Date(dataAtual.getFullYear(),(dataAtual.getMonth()),day ,0, 0, 0);
          let rec = this.movimentacoes.find(x => x.descricao.includes("[RECORRÊNCIA ID: " + el.id +"]") && new Date(x.data).getMonth() == dataAtual.getMonth() && new Date(x.data).getFullYear() == dataAtual.getFullYear());
          let movi_do_mes = this.movimentacoes.find(x => x.id == el.id_movimentacao && new Date(x.data).getMonth() == dataAtual.getMonth() && new Date(x.data).getFullYear() == dataAtual.getFullYear());
          let existe = false;
          if(rec != null  ){
            existe = true;
          }
          else if( rec == null && movi_do_mes != null){
            existe = true;
          }
          else{
            existe = false;
          }
          if(existe == false){
            if(el.tem_limite == true){
              if(el.repeticao>0){
                await this.InserirMovimentacao(movimentacao);
                el.repeticao = el.repeticao - 1;
                if(el.repeticao >0){
                  await this.updateRecorrencia(el);
                }
                else{
                  await this.deleteRecorrencia(el.id!);
                }
              }

            }
            else{
              await this.InserirMovimentacao(movimentacao);
            }
          }
        }
      });
    }
  }

  private async InserirMovimentacao(movimentacao: Movimentacao){
    try {
      const response = await this.commonService.postApi(API_INSERT_MOVIMENTACAO, movimentacao).toPromise();
    } catch (error) {
      console.error('Erro ao inserir movimentação:', error);
    }
  }
  private async updateRecorrencia(recorrencia: Recorrencia){
    try {
      const response = await this.commonService.postApi(API_UPDATE_RECORRENCIA, recorrencia).toPromise();
    } catch (error) {
      console.error('Erro ao atualizar recorrencia:', error);
    }
  }
  private async deleteRecorrencia(id: number){
    try {
      const response = await this.commonService.postApi(API_DELETE_RECORRENCIA, id).toPromise();
    } catch (error) {
      console.error('Erro ao atualizar recorrencia:', error);
    }
  }
  private async listarRecorrencias(){
    const result = await this.commonService.getApi<Recorrencia[]>(API_LISTAGEM_RECORRENCIAS).toPromise();
    if (result !== undefined) {
      this.recorrencias = result;
    }    
  }

  private async getMovimentacao(id: number): Promise<Movimentacao> {
      const params = {id: id}
      let result = await this.commonService.getApi<Movimentacao>(API_LISTAGEM_MOVIMENTACAO,params).toPromise();
      return result!;
  }
  
  private async listarMovimentacoes(): Promise<void> {
    const result = await this.commonService.getApi<Movimentacao[]>(API_LISTAGEM_MOVIMENTACOES).toPromise();
    if (result !== undefined) {
      this.movimentacoes = result;
    }    
    const copiaMovimentacoes = [...this.movimentacoes];
    this.movimentacoes = copiaMovimentacoes;
  }

  private compareDatesWithoutTime(date1: Date, date2: Date) {
    return this.commonService.compareDatesWithoutTime(date1, date2);
  }

  private async listarPlanejamentos(): Promise<void> {
    const dataAtual = new Date();
    
    try {
      const year = dataAtual.getFullYear();
      const month = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const day = String(dataAtual.getDate()).padStart(2, '0');

      const formattedDate = `${year}-${month}-${day}`;

      const params = { dataFinal: formattedDate };
      const result = await this.commonService.getApi<{ planejamento: Planejamento, itens: ItemPlanejamento[] }[]>(API_LISTAGEM_PLANEJAMENTOS_BY_DATAFINAL,params).toPromise();
        if (result !== undefined) {
          this.planejamentos = result;
      }
    } catch (error) {
      console.error('Erro ao obter planejamentos:', error);
    }
  }


  private async verificarPlanejamentos(): Promise<{ planejamento: Planejamento, itens: ItemPlanejamento[] }[]> {
    const planejamentosComprometidos: { planejamento: Planejamento, itens: ItemPlanejamento[] }[] = [];
    const dataAtual = new Date();
  
    await Promise.all(
      this.planejamentos.map(async (plan) => {
        let itensComprometidos: ItemPlanejamento[] = [];
  
        await Promise.all(
          plan.itens.map(async (item) => {
            const recorrencias = await this.commonService.getApi<Recorrencia[]>(API_LISTAGEM_RECORRENCIAS).toPromise();
            let movimentacoes = this.movimentacoes.filter((el) => 
            el.categoria === item.categoria 
            && el.data >= plan.planejamento.data_inicial 
            && el.data <= plan.planejamento.data_final
            && ['p', 'd', 'c'].includes(el.pagamento));
  
            if (recorrencias !== undefined) {
              const promises = recorrencias.map(async (element) => {
                let movimentacao = await this.getMovimentacao(element.id_movimentacao);
                if (movimentacao.categoria == item.categoria) {
                  if (new Date(movimentacao.data).getDate() > new Date().getDate()) {
                    if ((movimentacao.pagamento == "d" || movimentacao.pagamento == "c" || movimentacao.pagamento == "p") && movimentacao.tipo == "d") {
                      if (!movimentacoes.some((x) => x.id == movimentacao.id)) {
                        const dataAtual = new Date();
                        let rec = movimentacoes.find((x) => x.descricao.includes("[RECORRÊNCIA ID: " + movimentacao.id + "]") && new Date(x.data) <= dataAtual);
                        let existe = rec != null;
                        if (!existe) {
                          movimentacoes.push(movimentacao);
                        }
                      }
                    }
                  }
                }
              });
  
              await Promise.all(promises);
            }
            const totalGasto = this.somarValorItensPorCategoria(movimentacoes, plan.planejamento, item);
            let valorPlanejado = this.getValorItem(plan.planejamento, item);
            if (totalGasto > valorPlanejado) {
              itensComprometidos.push(item);
            }
          })
        );
  
        if (itensComprometidos.length > 0) {
          const planejamentoComprometido = {
            planejamento: plan.planejamento,
            itens: plan.itens,
          };
  
          if (new Date(planejamentoComprometido.planejamento.data_final) > dataAtual) {
            planejamentosComprometidos.push(planejamentoComprometido);
          }
        }
      })
    );
  
    return planejamentosComprometidos;
  }
  
  

  private somarValorItensPorCategoria(movimentacoes: Movimentacao[], planejamento: Planejamento, item: ItemPlanejamento): number {
    let total = 0;
    let filtered  = movimentacoes.filter(el => el.categoria === item.categoria);
    filtered.forEach(mov => {
      if(mov.tipo === 'd'){
        total+= parseFloat(mov.valor.toString());
      }
    });
    return total;
  }
  
  
  private getValorItem(planejamento: Planejamento, item: ItemPlanejamento):number{
    const valor = (planejamento.renda * item.porcentagem) / 100 ;
    return valor
  }

  private getCategoria(id: string): string {
    return this.commonService.getCategoria(id);
  }

  getPlanejamentosComprometidos():{ planejamento: Planejamento, itens: ItemPlanejamento[] }[]{
    return this.planejamentosComprometidos;
  }

  
}
