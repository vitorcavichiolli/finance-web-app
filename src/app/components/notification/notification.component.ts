import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { ItemPlanejamento, Planejamento } from 'src/app/utils/models/planejamentos.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit{
  @Input() data: { planejamento: Planejamento, itens: ItemPlanejamento[] }[] =[];
  notificacoes: { planejamento: Planejamento, itens: ItemPlanejamento[] }[] =[];
  @Output() notificationSelected: EventEmitter<{
    planejamento: Planejamento;
    itens: ItemPlanejamento[];
  }> = new EventEmitter();
  constructor(
    private commonService: CommonService
  ){}

  ngOnInit(): void {
    this.notificacoes = this.data;
    console.log(this.notificacoes);
  }

  getCategoria(id: string): string {
    return this.commonService.getCategoria(id);
  }

    
  getValorItem(planejamento: Planejamento, item: ItemPlanejamento):number{
    const valor = (planejamento.renda * item.porcentagem) / 100 ;
    return valor
  }
 
  onNotificationSelect(notification: {
    planejamento: Planejamento;
    itens: ItemPlanejamento[];
  }): void {
    this.notificationSelected.emit(notification);
  }
}
