import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
import { API_LISTAGEM_MOVIMENTACAO, API_LISTAGEM_RECORRENCIAS } from 'src/app/utils/api/api';
import { Recorrencia } from 'src/app/utils/models/recorrencia.model';
import { LoadingService } from 'src/app/utils/loading-service/loading.service';
interface RecorrenciaComMovimentacao extends Recorrencia{
  movimentacao: Movimentacao,
}
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges, OnInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['data', 'categoria', 'pagamento', 'descricao', 'valor','actions'];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalGastos:number = 0;
  totalReceita: number = 0;
  total: number = 0;
  private _data: any[] = [];
  recorrenciasComMovimentacao: RecorrenciaComMovimentacao[] = [];
  recorrencias: Recorrencia[] = [];
  totalGastosLancamentosFuturos: number =0;
  totalReceitasLancamentosFuturos: number =0;

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
    public loadingService: LoadingService

    ){}
  
  async ngOnInit(){
   
  }

  
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateDataSource();
      this.dataSource.paginator = this.paginator;
      await this.listarRecorrencias();
    }
    this.getValorTotal(this.data);
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

  getValorTotal(data:any){
    let total:number = 0;
    let totalGastos: number=0;
    let totalReceita:number = 0;
    data.forEach((element:any )=> {
      if((element.tipo === 'd') && (element.pagamento === 'p' || element.pagamento === 'c' || element.pagamento === 'd')){
        totalGastos += parseFloat(element.valor);
      }
      else if((element.tipo === 'r') && (element.pagamento === 'p' || element.pagamento === 'c' || element.pagamento === 'd')){
        totalReceita += parseFloat(element.valor);
      }
    });
    total = totalReceita - totalGastos;
    this.total = total;
    this.totalGastos = totalGastos;
    this.totalReceita = totalReceita;
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
        console.log(result)
        result.forEach(async element => {
          let movimentacao = await this.getMovimentacao(element.id_movimentacao);
          if(new Date(movimentacao.data).getDate() > new Date().getDate()){
            let item: RecorrenciaComMovimentacao = {
              id_movimentacao: element.id_movimentacao,
              id: element.id, 
              tem_limite: element.tem_limite, 
              repeticao: element.repeticao,
              parcelas_exibicao: element.parcelas_exibicao,
              movimentacao: movimentacao,
             
            }
            if((movimentacao.pagamento == "d" || movimentacao.pagamento == "c" || movimentacao.pagamento == "p") && movimentacao.tipo == "d"){
              if(!this._data.some(x => x.id == movimentacao.id)){
                const dataAtual = new Date();
                let rec = this._data.find(x => x.descricao.includes("[RECORRÊNCIA ID: " + movimentacao.id +"]") && new Date(x.data).toDateString() == dataAtual.toDateString());
                let existe = rec != null;
                if(!existe){
                  this.totalGastosLancamentosFuturos += movimentacao.valor;
                }
              }
            }
            else if((movimentacao.pagamento == "d" || movimentacao.pagamento == "c" || movimentacao.pagamento == "p") && movimentacao.tipo == "r"){
              this.totalReceitasLancamentosFuturos += movimentacao.valor;
            }
            this.recorrenciasComMovimentacao.push(item);
          }  

        });
        
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
}
