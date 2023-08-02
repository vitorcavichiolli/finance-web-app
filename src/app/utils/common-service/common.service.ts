import { Injectable } from '@angular/core';

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

}
