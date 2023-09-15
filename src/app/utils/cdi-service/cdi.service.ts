import { Injectable } from '@angular/core';
import { addDays, isWeekend } from 'date-fns';


@Injectable({
  providedIn: 'root'
})
export class CdiService {
  private taxaCDI: number = 1.02; // 102% do CDI
  constructor() { }

  calcularRendimentoCDI(valorInicial: number, dias: number) {
    let data = new Date();
    let total = valorInicial;
  
    for (let i = 0; i < dias; i++) {
      // Verificar se o dia é um fim de semana
      while (isWeekend(data)) {
        data = addDays(data, 1);
      }
  
      total *= this.taxaCDI;
      data = addDays(data, 1);
    }
  
    return total;
  }
}
