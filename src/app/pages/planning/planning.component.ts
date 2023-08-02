import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { ModalPlanejamentoComponent } from 'src/app/components/modal-planejamento/modal-planejamento.component';
import { ModalService } from 'src/app/utils/modal-service/modal.service';
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
  constructor(
    private planejamentoService: PlanningDataService,
    public dialog: MatDialog,
    public modalService: ModalService
    ) {}
  async ngOnInit(): Promise<void> {
    // Chame o método getAllPlanejamentos() do serviço para obter todos os planejamentos
    await this.getAllPlanejamentos();
  }

  async getAllPlanejamentos(): Promise<void> {
    try {
      this.planejamentos = await this.planejamentoService.getAllPlanejamentos();

    } catch (error) {
      console.error('Error fetching planejamentos:', error);
    }
  }

  openEditModal(planejamento: Planejamento): void {
    const dialogRef = this.dialog.open(ModalPlanejamentoComponent, {
      // Outras configurações do dialog
      data: {
        planejamento,
        isEditMode: true
      }
    });
  }

  async onPlanejamentoSelect(planejamentoId: number): Promise<void> {
    try {
      // Chame o método getPlanejamentoWithItems() do serviço para obter o planejamento e seus itens
      this.selectedPlanejamento = await this.planejamentoService.getPlanejamentoWithItems(planejamentoId);
      console.log(this.selectedPlanejamento);
      this.modalService.openModal();
    } catch (error) {
      console.error('Error fetching planejamento with items:', error);
    }
  }

  async deletePlanejamento(id: number | undefined): Promise<void> {
    if (typeof id === 'number') {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          message: 'Tem certeza que deseja excluir este planejamento?',
          confirmText: 'Confirmar',
          cancelText: 'Cancelar'
        }
      });
  
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          // Usuário confirmou a exclusão, chama a função deleteMovimentacao
          this.planejamentoService.deletePlanejamento(id).then(() => {
            window.location.reload();
          });
        } else {
          // Usuário cancelou a exclusão
        }
      });
      
    } else {
      console.error('ID inválido. A movimentação precisa ter um ID válido para ser excluída.');
      // Exibir uma mensagem de erro ou lidar com a situação de ID inválido.
    }
  }

  
}
