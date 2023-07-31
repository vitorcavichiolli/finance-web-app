import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['data', 'tipo', 'categoria', 'pagamento', 'descricao', 'valor'];
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

  constructor(private _liveAnnouncer: LiveAnnouncer){}
  
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

  formatarValor(valor: number | string): string {
    valor = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  converterValorParaNumero(valor: string | number): number {
    if (typeof valor === 'string') {
      return parseFloat(valor.replace(',', '.'));
    }
    return valor as number;
  }

  getTipo(id:string):string{
    const retornoEncontrado = tipos.find((el) => el.id === id);
    if (retornoEncontrado) {
      return retornoEncontrado.nome;
    } else {
      return '-';
    }
  }

  getCategoria(id: string): string {
    const retornoEncontrado = categorias.find((el) => el.id === parseInt(id));
    if (retornoEncontrado) {
      return retornoEncontrado.nome;
    } else {
      return '-';
    }
  }
  
  getPagamento(id:string):string{
    const retornoEncontrado = pagamentos.find((el) => el.id === id);
    if (retornoEncontrado) {
      return retornoEncontrado.nome;
    } else {
      return '-';
    }
  }

 
  
}
