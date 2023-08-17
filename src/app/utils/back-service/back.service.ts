import { Injectable, OnInit, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { DataService } from '../data-service/data.service';
import { PlanningDataService } from '../planning-data-service/planning-data.service';
import { CommonService } from '../common-service/common.service';
import { Movimentacao } from '../models/movimentacao.model';
import { ItemPlanejamento, Planejamento } from '../models/planejamentos.model';
import { EventEmitter } from '@angular/core';
import { API_LISTAGEM_MOVIMENTACOES, API_LISTAGEM_PLANEJAMENTOS_BY_DATAFINAL } from '../api/api';

@Injectable({
  providedIn: 'root'
})
export class BackService  {
  private taskSubscription: Subscription | undefined;
  private movimentacoes: Movimentacao[] = [];
  private planejamentos: { planejamento: Planejamento, itens: ItemPlanejamento[] }[] = [];
  private planejamentosComprometidos: { planejamento: Planejamento, itens: ItemPlanejamento[] }[] = [];
  @Output() notificacoesAtualizadas: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private commonService: CommonService
  ) { }

  async startBackgroundTask(): Promise<void> {
    await this.listarMovimentacoes();
    await this.listarPlanejamentos();
    this.taskSubscription = interval(2000).subscribe(async () => {
      await this.performBackgroundTask();
    });
  }

  stopBackgroundTask(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
      this.taskSubscription = undefined;
    }
  }

  private async performBackgroundTask(): Promise<void> {
    this.planejamentosComprometidos = await this.verificarPlanejamentos();
    this.notificacoesAtualizadas.emit();
  }
  
  private async listarMovimentacoes(): Promise<void> {
    const result = await this.commonService.getApi<Movimentacao[]>(API_LISTAGEM_MOVIMENTACOES).toPromise();
    if (result !== undefined) {
      this.movimentacoes = result;
    }    
    const copiaMovimentacoes = [...this.movimentacoes];
    this.movimentacoes = copiaMovimentacoes;
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

    this.planejamentos.forEach(plan => {
      const itensComprometidos: ItemPlanejamento[] = [];
  
      plan.itens.forEach(item => {
        const total = this.somarValorItensPorCategoria(this.movimentacoes, plan.planejamento, item);
        
        if (total > this.getValorItem(plan.planejamento, item)) {
          itensComprometidos.push(item);
        }
      });
  
      if (itensComprometidos.length > 0) {
        const planejamentoComprometido = {
          planejamento: plan.planejamento,
          itens:  plan.itens  
        };

        if(dataAtual <= new Date(planejamentoComprometido.planejamento.data_final)){
          planejamentosComprometidos.push(planejamentoComprometido);
        }

      }
    });
  
    return planejamentosComprometidos;
  }
  

  private somarValorItensPorCategoria(movimentacoes: Movimentacao[], planejamento: Planejamento, item: ItemPlanejamento): number {
    let total = 0;
    let filtered  = movimentacoes.filter(el => el.categoria === item.categoria && el.data >= planejamento.data_inicial && el.data <= planejamento.data_final);
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
