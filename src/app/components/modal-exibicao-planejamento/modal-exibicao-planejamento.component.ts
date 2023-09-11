import { Component, Input, OnInit } from '@angular/core';
import { API_LISTAGEM_MOVIMENTACAO, API_LISTAGEM_MOVIMENTACOES_BY_CATEGORA_DATA, API_LISTAGEM_MOVIMENTACOES_BY_CATEGORA_PERIODO, API_LISTAGEM_MOVIMENTACOES_BY_PERIODO, API_LISTAGEM_RECORRENCIAS } from 'src/app/utils/api/api';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { DataService } from 'src/app/utils/data-service/data.service';
import { LoadingService } from 'src/app/utils/loading-service/loading.service';
import { ModalService } from 'src/app/utils/modal-service/modal.service';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { Planejamento } from 'src/app/utils/models/planejamentos.model';
import { Recorrencia } from 'src/app/utils/models/recorrencia.model';
interface RecorrenciaComMovimentacao extends Recorrencia{
  movimentacao: Movimentacao,
}
@Component({
  selector: 'app-modal-exibicao-planejamento',
  templateUrl: './modal-exibicao-planejamento.component.html',
  styleUrls: ['./modal-exibicao-planejamento.component.scss']
})
export class ModalExibicaoPlanejamentoComponent implements OnInit {

  @Input() data: { planejamento: Planejamento, itens: any[] } | null = null;
  diasRestantes: number | undefined = 0;
  valoresUtilizadosPorCategoria: { [categoria: number]: number } = {};
  porcentagemUtilizadosPorCategoria: { [categoria: number]: number } = {};
  valoresRestantePorCategoria: { [categoria: number]: number } = {};
  valorTotalPlanejado:number = 0;
  valorTotalUtilizado: number = 0;
  rendaNaoPlanejada: number = 0;
  gastosNaoPlanejados: number =0;
  totalNaoPlanejado: number = 0;

  constructor(
    public modalService: ModalService,
    private commonService: CommonService,
    public loadingService: LoadingService

  ){}

  async ngOnInit(): Promise<void> {
    
  }

  async ngOnChanges() {
    this.loadingService.openLoading();
    this.valorTotalPlanejado = 0;
      this.valorTotalUtilizado = 0;
      this.rendaNaoPlanejada = 0;
    if (this.data?.itens) {
      let total =0;
      let totalUtilizado = 0;
      for (const item of this.data.itens) {
        await this.valorUtilizadoPorItem(item.categoria)
       
        total += this.getValorItem(item.porcentagem);
        totalUtilizado += this.valoresUtilizadosPorCategoria[item.categoria];

      }
      this.valorTotalPlanejado = total;
      this.valorTotalUtilizado = totalUtilizado;
      this.rendaNaoPlanejada = this.data.planejamento.renda - this.valorTotalPlanejado;
      await this.getNaoPlanejados();
    }

    this.loadingService.closeLoading();

  }

  
  async getMovimentacao(id: number): Promise<Movimentacao> {
    const params = {id: id}
    const result = await this.commonService.getApi<Movimentacao>(API_LISTAGEM_MOVIMENTACAO,params).toPromise();
    return result!;
  } 

  async getNaoPlanejados(){
    const dataInicial = this.data?.planejamento?.data_inicial;
    const dataFinal = this.data?.planejamento?.data_final;
    this.gastosNaoPlanejados =0;
    this.totalNaoPlanejado = 0;
    if (dataInicial && dataFinal) {
      const params = {
        dataInicial: dataInicial, 
        dataFinal: dataFinal
      }
      let movimentacoes:Movimentacao[] = [];
      const result = await this.commonService.getApi<Movimentacao[]>(API_LISTAGEM_MOVIMENTACOES_BY_PERIODO, params).toPromise();
      if (result !== undefined) {
        result.forEach(el => {
          if(!this.data!.itens.some(x => x.categoria == el.categoria)){
            if((el.pagamento == "d" || el.pagamento == "c" || el.pagamento == "p") && el.tipo == "d"){
              movimentacoes.push(el);
              
            }
          }
        });

        const recorrencias = await this.commonService.getApi<Recorrencia[]>(API_LISTAGEM_RECORRENCIAS).toPromise();
        if (recorrencias !== undefined) {
          const promises = recorrencias.map(async element => {
            let movimentacao = await this.getMovimentacao(element.id_movimentacao);
            if (new Date(movimentacao.data).getDate() > new Date().getDate()) {
              if ((movimentacao.pagamento == "d" || movimentacao.pagamento == "c" || movimentacao.pagamento == "p") && movimentacao.tipo == "d") {
                if (!movimentacoes.some(x => x.id == movimentacao.id)) {
                  const dataAtual = new Date();
                  let rec = movimentacoes.find(x => x.descricao.includes("[RECORRÊNCIA ID: " + movimentacao.id + "]") && new Date(x.data) <= dataAtual);
                  let existe = rec != null;
                  if (!existe) {
                    if (!this.data!.itens.some(x => x.categoria == movimentacao.categoria)) {
                      movimentacoes.push(movimentacao);

                    }
                  }
                }
              }
            }
          }); 
          await Promise.all(promises); // Aguarda a conclusão de todas as promessas

          }

          movimentacoes.forEach(element => {
            this.gastosNaoPlanejados += element.valor;
          });

          this.totalNaoPlanejado = this.rendaNaoPlanejada - this.gastosNaoPlanejados;
       
      }    
    }
  }

  
  
  closeModal(){
    this.modalService.closeModal();
  }

  formataValor(value: number | string):string{
    return this.commonService.formatarValor(value);
  }

  
  getCategoria(id: string): string {
    return this.commonService.getCategoria(id);
  }

  getValorItem(porc:number):number{
    const valor = this.data && this.data.planejamento ? (this.data.planejamento.renda * porc) / 100 : 0;
    return valor
  }

  isPlanningOver(): boolean {
    const currentDate = new Date();
    const dataInicial = this.data?.planejamento?.data_inicial;
    const dataFinal = this.data?.planejamento?.data_final;
    if (!dataInicial || !dataFinal) {
      return false;
    }
    const startDate = new Date(dataInicial);
    const endDate = new Date(dataFinal);
  
    if (currentDate < startDate) {
      const timeDifference = endDate.getTime() - startDate.getTime();
      const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
      this.diasRestantes = remainingDays;
      return false;
    } else if (currentDate > endDate) {
      this.diasRestantes = 0;
      return true;
    } else {
      const timeDifference = endDate.getTime() - currentDate.getTime();
      const remainingDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
      this.diasRestantes = remainingDays;
      return false;
    }
  }
  
  async valorUtilizadoPorItem(categoria: number): Promise<void> {
    const dataInicial = this.data?.planejamento?.data_inicial;
    const dataFinal = this.data?.planejamento?.data_final;
    let valor: number = 0;
    if (dataInicial && dataFinal) {
      const params = {
        dataInicial: dataInicial, 
        dataFinal: dataFinal, 
        categoria: categoria
      }
      let movimentacoes: Movimentacao[] = [];
    
      const result = await this.commonService.getApi<Movimentacao[]>(API_LISTAGEM_MOVIMENTACOES_BY_CATEGORA_PERIODO, params).toPromise();
    
      if (result !== undefined) {
        movimentacoes = result;
      }

      const recorrencias = await this.commonService.getApi<Recorrencia[]>(API_LISTAGEM_RECORRENCIAS).toPromise();
    
      if (recorrencias !== undefined) {
        const promises = recorrencias.map(async element => {
          let movimentacao = await this.getMovimentacao(element.id_movimentacao);
          if(movimentacao.categoria == categoria){
            if (new Date(movimentacao.data).getDate() > new Date().getDate()) {
              if ((movimentacao.pagamento == "d" || movimentacao.pagamento == "c" || movimentacao.pagamento == "p") && movimentacao.tipo == "d") {
                if (!movimentacoes.some(x => x.id == movimentacao.id)) {
                  const dataAtual = new Date();
                  let rec = movimentacoes.find(x => x.descricao.includes("[RECORRÊNCIA ID: " + movimentacao.id + "]") && new Date(x.data) <= dataAtual);
                  let existe = rec != null;
                  if (!existe) {
                    movimentacoes.push(movimentacao);
                  }
                }
              }
            }
          }
        });
    
        await Promise.all(promises); // Aguarda a conclusão de todas as promessas
    
        movimentacoes.forEach((element) => {
          if (element.pagamento == "p" || element.pagamento == "d" || element.pagamento == "c") {
            valor += parseFloat(element.valor.toString());
          }
        });
      }
    }
    
    const porc_item:number = this.data?.itens.find(el => el.categoria === categoria).porcentagem;
    const valor_item = this.getValorItem(porc_item);
    let porc:number = Math.floor((valor * 100) / valor_item);
    this.porcentagemUtilizadosPorCategoria[categoria] = porc;
    this.valoresUtilizadosPorCategoria[categoria] = valor;
    this.valoresRestantePorCategoria[categoria] = valor_item - valor;
  }
 

}
