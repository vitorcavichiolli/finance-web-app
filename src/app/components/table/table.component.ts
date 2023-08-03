import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { DataService } from 'src/app/utils/data-service/data.service';
import { MatDialog } from '@angular/material/dialog';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['data', 'categoria', 'pagamento', 'descricao', 'valor','actions'];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private _data: any[] = [];

  @Input() set data(data: any[]) {
    this._data = data;
    this.updateDataSource();
  }

  get data(): any[] {
    return this._data;
  }

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    private commonService: CommonService,
    public dialog: MatDialog,
    private dataService:DataService,
    ){}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateDataSource();
      this.dataSource.paginator = this.paginator;
    }
  }

  private updateDataSource(): void {
    if (this.data) {
      const dataWithNumericValues = this.data.map((item) => ({
        ...item,
        valor: this.converterValorParaNumero(item.valor)
      }));
      this.dataSource.data = dataWithNumericValues;
      this.dataSource.sort = this.sort;
    }
  }
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }


  formatarValor(valor: number | string): string{
    return this.commonService.formatarValor(valor);
  }
  
  converterValorParaNumero(valor: string | number): number {
    if (typeof valor === 'string') {
      return parseFloat(valor.replace(',', '.'));
    }
    return valor as number;
  }

  getTipo(id:string):string{
    return this.commonService.getTipo(id);
  }

  getCategoria(id: string): string {
    return this.commonService.getCategoria(id);
  }
  
  getPagamento(id:string):string{
    return this.commonService.getPagamento(id);
  }

  async deleteMovimentacao(id: number | undefined): Promise<void> {
    if (typeof id === 'number') {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          message: 'Tem certeza que deseja excluir esta movimentação?',
          confirmText: 'Confirmar',
          cancelText: 'Cancelar'
        }
      });
  
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          // Usuário confirmou a exclusão, chama a função deleteMovimentacao
          this.dataService.deleteMovimentacao(id).then(() => {
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

  openEditModal(movimentacao: Movimentacao): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      // Outras configurações do dialog
      data: {
        movimentacao,
        isEditMode: true
      }
    });
  }
  
}
