import { Component, OnInit } from '@angular/core';
import { ItemPlanejamento, Planejamento } from 'src/app/utils/models/planejamentos.model';
import { PlanningDataService } from 'src/app/utils/planning-data-service/planning-data.service';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit{
  planejamentos: Planejamento[] = [];
  selectedPlanejamento: { planejamento: Planejamento, itens: any[] } | null = null;

  constructor(private planejamentoService: PlanningDataService) {}
  async ngOnInit(): Promise<void> {
    // Chame o método getAllPlanejamentos() do serviço para obter todos os planejamentos
    await this.getAllPlanejamentos();
    this.planejamentos.forEach(el =>{
      if(el.id){
        this.onPlanejamentoSelect(el.id);
      }
    });
  }

  async getAllPlanejamentos(): Promise<void> {
    try {
      this.planejamentos = await this.planejamentoService.getAllPlanejamentos();
      console.log(this.planejamentos);

    } catch (error) {
      console.error('Error fetching planejamentos:', error);
    }
  }

  async onPlanejamentoSelect(planejamentoId: number): Promise<void> {
    try {
      // Chame o método getPlanejamentoWithItems() do serviço para obter o planejamento e seus itens
      this.selectedPlanejamento = await this.planejamentoService.getPlanejamentoWithItems(planejamentoId);
      console.log(this.selectedPlanejamento);
    } catch (error) {
      console.error('Error fetching planejamento with items:', error);
    }
  }
}
