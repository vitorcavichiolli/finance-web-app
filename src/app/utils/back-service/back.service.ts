import { Injectable, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { DataService } from '../data-service/data.service';
import { PlanningDataService } from '../planning-data-service/planning-data.service';
import { CommonService } from '../common-service/common.service';
import { Movimentacao } from '../models/movimentacao.model';
import { ItemPlanejamento, Planejamento } from '../models/planejamentos.model';

@Injectable({
  providedIn: 'root'
})
export class BackService  {
  private taskSubscription: Subscription | undefined;
  private movimentacoes: Movimentacao[] = [];
  private planejamentos: { planejamento: Planejamento, itens: ItemPlanejamento[] }[] = [];
  private planejamentosComprometidos: Planejamento[] = [];
  constructor(
    private dataService: DataService,
    private planningService: PlanningDataService,
    private commonService: CommonService
  ) { }

  
  private async listarMovimentacoes(): Promise<void> {
    this.movimentacoes = await this.dataService.getAllMovimentacoes();
    const copiaMovimentacoes = [...this.movimentacoes];
    this.movimentacoes = copiaMovimentacoes;
  }

  private async listarPlanejamentos(): Promise<void> {
    const dataAtual = new Date();
    
    try {
      this.planejamentos = await this.planningService.getPlanejamentosByDataFinal(dataAtual);
    } catch (error) {
      console.error('Erro ao obter planejamentos:', error);
    }
  }

  async startBackgroundTask(): Promise<void> {
    await this.listarMovimentacoes();
    await this.listarPlanejamentos();
    this.taskSubscription = interval(5000).subscribe(async () => {
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
  }
  
  private async verificarPlanejamentos(): Promise<Planejamento[]>{
    let retorno: Planejamento[] = [];
    this.planejamentos.forEach(plan =>{
      plan.itens.forEach(item => {
          const total = this.somarValorItensPorCategoria(this.movimentacoes, plan.planejamento, item);
          if(total > this.getValorItem(plan.planejamento, item)){
            retorno.push(plan.planejamento);
          }
      })
    });
    return retorno;
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
  
  
  getValorItem(planejamento: Planejamento, item: ItemPlanejamento):number{
    const valor = (planejamento.renda * item.porcentagem) / 100 ;
    return valor
  }

  getCategoria(id: string): string {
    return this.commonService.getCategoria(id);
  }
}
