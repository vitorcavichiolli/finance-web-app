import { Injectable } from '@angular/core';
import { categorias, pagamentos, tipos } from '../data/data';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  formatarValor(valor: number | string): string {
    if(this.checkEmptyNullUndefined(valor)){
      valor = typeof valor === 'string' ? parseFloat(valor.replace(',', '.')) : valor;
      return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
   else{
    valor = 0;
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
   }
  }

  checkEmptyNullUndefined(value:any):boolean{
    return !(value == '' || value == null || value == undefined)
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
