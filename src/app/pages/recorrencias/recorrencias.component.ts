import { Component, OnInit } from '@angular/core';
import { API_LISTAGEM_MOVIMENTACAO, API_LISTAGEM_RECORRENCIAS } from 'src/app/utils/api/api';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { LoadingService } from 'src/app/utils/loading-service/loading.service';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { Recorrencia } from 'src/app/utils/models/recorrencia.model';

interface RecorrenciaComMovimentacao extends Recorrencia{
  movimentacao: Movimentacao,
}

@Component({
  selector: 'app-recorrencias',
  templateUrl: './recorrencias.component.html',
  styleUrls: ['./recorrencias.component.scss']
})

export class RecorrenciasComponent implements OnInit{
  recorrencias: Recorrencia[] = [];
  recorrenciasComMovimentacao: RecorrenciaComMovimentacao[] = [];
  totalGastosLancamentosFuturos: number =0;
  totalReceitasLancamentosFuturos: number =0;
  constructor(
    private commonService: CommonService,
    public loadingService: LoadingService
  ) {}

  async ngOnInit(): Promise<void> {
    // Chame o método getAllPlanejamentos() do serviço para obter todos os planejamentos
    await this.verificaToken();

    
  }
  async verificaToken(){
    if(sessionStorage.getItem('token')){
      await this.listarRecorrencias();
    }
  }

  async listarRecorrencias(): Promise<void> {
    this.loadingService.openLoading();
    this.totalGastosLancamentosFuturos = 0;
    this.totalReceitasLancamentosFuturos = 0;
  
    try {
      const result = await this.commonService.getApi<Recorrencia[]>(API_LISTAGEM_RECORRENCIAS).toPromise();
      if (result !== undefined) {
        result.sort((a, b) => {
          if (b.id && a.id) {
            return a.id - b.id; // Ordenar em ordem crescente
          } else {
            return 0;
          }
        });
        this.recorrencias = result;
  
        for (const element of result) {
          let movimentacao = await this.getMovimentacao(element.id_movimentacao);
          let item: RecorrenciaComMovimentacao = {
            id_movimentacao: element.id_movimentacao,
            id: element.id, 
            tem_limite: element.tem_limite, 
            repeticao: element.repeticao,
            parcelas_exibicao: element.parcelas_exibicao,
            movimentacao: movimentacao,
          }
  
          if ((movimentacao.pagamento == "d" || movimentacao.pagamento == "c" || movimentacao.pagamento == "p") && movimentacao.tipo == "d") {
            this.totalGastosLancamentosFuturos += movimentacao.valor;
          } else if ((movimentacao.pagamento == "d" || movimentacao.pagamento == "c" || movimentacao.pagamento == "p") && movimentacao.tipo == "r") {
            this.totalReceitasLancamentosFuturos += movimentacao.valor;
          }
  
          this.recorrenciasComMovimentacao.push(item);
        }
        
      }
      
      this.recorrenciasComMovimentacao.sort((a, b) => {
        if (b.id && a.id) {
          return a.id - b.id; // Ordenar em ordem crescente
        } else {
          return 0;
        }
      });
      this.loadingService.closeLoading();
  
    } catch (error) {
      this.loadingService.closeLoading();
      console.error('Error fetching recorrencias:', error);
    }
  }
  

  async getMovimentacao(id: number): Promise<Movimentacao> {
      const params = {id: id}
      const result = await this.commonService.getApi<Movimentacao>(API_LISTAGEM_MOVIMENTACAO,params).toPromise();
      return result!;
  }

  formataValor(value: number | string):string{
    return this.commonService.formatarValor(value);
  }

  
  getCategoria(id: string): string {
    return this.commonService.getCategoria(id);
  }

  getTipo(id: string): string {
    return this.commonService.getTipo(id);
  }

  getPagamento(id: string): string {
    return this.commonService.getPagamento(id);
  }

  getConta(id: string): string {
    return this.commonService.getConta(id);
  }

  getDay(date:Date){
    date = new Date(date);
    return date.getDate();
  }

  formatarValor(valor: number | string): string{
    return this.commonService.formatarValor(valor);
  }
}
