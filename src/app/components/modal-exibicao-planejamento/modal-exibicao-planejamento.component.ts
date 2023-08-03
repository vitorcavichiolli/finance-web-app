import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { DataService } from 'src/app/utils/data-service/data.service';
import { ModalService } from 'src/app/utils/modal-service/modal.service';
import { Planejamento } from 'src/app/utils/models/planejamentos.model';

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
  valorTotalUtilizado: number = 0
  constructor(
    public modalService: ModalService,
    private commonService: CommonService,
    private dataService: DataService
  ){}

  async ngOnInit(): Promise<void> {
    
  }

  async ngOnChanges() {
    if (this.data?.itens) {
      let total =0;
      let totalUtilizado = 0;
      for (const item of this.data.itens) {
        await this.valorUtilizadoPorItem(item.categoria)
       
        total += this.getValorItem(item.porcentagem);
        totalUtilizado += this.valoresUtilizadosPorCategoria[item.categoria];

      }
      console.log(total);
      this.valorTotalPlanejado = total;
      this.valorTotalUtilizado = totalUtilizado;
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
      const timeDifference = startDate.getTime() - currentDate.getTime();
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
      const movimentacoes = await this.dataService.getMovimentacaoByCategoriaAndDate(categoria, dataInicial, dataFinal);
      movimentacoes.forEach((element) => {
        valor += parseFloat(element.valor.toString());
      });
    }
    const porc_item:number = this.data?.itens.find(el => el.categoria === categoria).porcentagem;
    const valor_item = this.getValorItem(porc_item);
    let porc:number = Math.floor((valor * 100) / valor_item);
    this.porcentagemUtilizadosPorCategoria[categoria] = porc;
    this.valoresUtilizadosPorCategoria[categoria] = valor;
    this.valoresRestantePorCategoria[categoria] = valor_item - valor;
  }
 
}
