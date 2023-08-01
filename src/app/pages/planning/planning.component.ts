import { Component, OnInit } from '@angular/core';
import { ItemPlanejamento, Planejamento } from 'src/app/utils/models/planejamentos.model';
import { PlanningDataService } from 'src/app/utils/planning-data-service/planning-data.service';

@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit{
  selectedPlanejamento: { planejamento: Planejamento, itens: ItemPlanejamento[] } | null = null;
  planejamentos: Planejamento[] = []

  constructor(private planejamentoService: PlanningDataService) {}
  async ngOnInit(): Promise<void> {
    try {
      this.planejamentos = await this.planejamentoService.getAllPlanejamentos();
    } catch (error) {
      console.error('Error fetching planejamentos:', error);
    }
    console.log(this.planejamentos)
  }
}
