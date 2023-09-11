import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { ModalPlanejamentoComponent } from 'src/app/components/modal-planejamento/modal-planejamento.component';
import { API_DELETE_PLANEJAMENTO, API_LISTAGEM_PLANEJAMENTOS, API_LISTAGEM_PLANEJAMENTOS_WITH_ITENS } from 'src/app/utils/api/api';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { LoadingService } from 'src/app/utils/loading-service/loading.service';
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
    public dialog: MatDialog,
    public modalService: ModalService,
    private commonService: CommonService,
    public loadingService: LoadingService

    ) {}

  async ngOnInit() {
    await this.verificaToken();
   
   }
   async verificaToken(){
     if(sessionStorage.getItem('token')){
      await this.getAllPlanejamentos();
     }
   }

  async getAllPlanejamentos(): Promise<void> {
    this.loadingService.openLoading();

    try {
      const result = await this.commonService.getApi<Planejamento[]>(API_LISTAGEM_PLANEJAMENTOS).toPromise();
      if (result !== undefined) {
        this.planejamentos = result;
      }
      this.loadingService.closeLoading();

    } catch (error) {
      this.loadingService.closeLoading();
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
      const params = {id: planejamentoId}
      const result = await this.commonService.getApi<{ planejamento: Planejamento, itens: any[] }>(API_LISTAGEM_PLANEJAMENTOS_WITH_ITENS,params).toPromise();
      if (result !== undefined) {
        this.selectedPlanejamento = result;
      }
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
          this.loadingService.openLoading();

          const body = parseInt(id.toString());
          this.commonService.deleteApi<any>(API_DELETE_PLANEJAMENTO, body).subscribe(
            response => {
              window.location.reload();
            },
            error => {
              console.error('Error deleting item', error);
            }
          );
        } else {
          // Usuário cancelou a exclusão
        }
      });
      
    } else {
      console.error('ID inválido. A movimentação precisa ter um ID válido para ser excluída.');
      // Exibir uma mensagem de erro ou lidar com a situação de ID inválido.
    }
  }

  openInsertModal() {
    // Open the Material Dialog
    const dialogRef = this.dialog.open(ModalPlanejamentoComponent, {
      data: {
        isEditMode: false
      }
    });

    // Handle dialog close event if needed
    dialogRef.afterClosed().subscribe((result) => {
    });
  }
}
