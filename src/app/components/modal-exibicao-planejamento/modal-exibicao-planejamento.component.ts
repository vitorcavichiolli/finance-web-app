import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { ModalService } from 'src/app/utils/modal-service/modal.service';
import { Planejamento } from 'src/app/utils/models/planejamentos.model';

@Component({
  selector: 'app-modal-exibicao-planejamento',
  templateUrl: './modal-exibicao-planejamento.component.html',
  styleUrls: ['./modal-exibicao-planejamento.component.scss']
})
export class ModalExibicaoPlanejamentoComponent implements OnInit {

  @Input() data: { planejamento: Planejamento, itens: any[] } | null = null;

  constructor(
    public modalService: ModalService,
    private commonService: CommonService
  ){}

  async ngOnInit(): Promise<void> {
  }
  closeModal(){
    this.modalService.closeModal();
  }

  formataValor(value: number | string):string{
    return this.commonService.formatarValor(value);
  }
}
