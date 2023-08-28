import { Injectable } from '@angular/core';
import { categorias, contas, pagamentos, tipos } from '../data/data';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) { }

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

  getConta(id:string):string{
    const retornoEncontrado = contas.find((el) => el.id === id);
    if (retornoEncontrado) {
      return retornoEncontrado.nome;
    } else {
      return '-';
    }
  }

  public getApi<T>(url: string, queryParams?: any): Observable<T> {
    let headers = new HttpHeaders({
      'accept': '*/*' // Defina os headers necessários aqui
    });
    let params = new HttpParams();
    if (queryParams) {
      Object.keys(queryParams).forEach((key) => {
        params = params.append(key, queryParams[key]);
      });
    }

    return this.http.get<T>(url, { headers, params });
  }

  public postApi<T>(url: string, body: any): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'text/plain' // Você pode ajustar o cabeçalho de aceitação conforme necessário
    });

    return this.http.post<T>(url, body, { headers });
  }

  public putApi<T>(url: string, body: any): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'text/plain' ,
    });

    return this.http.post<T>(url, body, { headers });
  }

  public deleteApi<T>(url: string, body: any): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'text/plain',
    });
  
    return this.http.post<T>(url, body, { headers });
  }

  formatarData(data: string | undefined | Date): string {
    if (!data) {
      return '';
    }

    const dataObj = new Date(data);
    const year = dataObj.getFullYear();
    const month = String(dataObj.getMonth() + 1).padStart(2, '0');
    const day = String(dataObj.getDate()).padStart(2, '0');

    return `${day}/${month}/${year}`;
  }

  compareDatesWithoutTime(date1: Date, date2: Date) {
    const year1 = date1.getFullYear();
    const month1 = date1.getMonth();
    const day1 = date1.getDate();
  
    const year2 = date2.getFullYear();
    const month2 = date2.getMonth();
    const day2 = date2.getDate();
  
    if (year1 === year2 && month1 === month2 && day1 === day2) {
      return 0; // As datas são iguais
    } else if (year1 < year2 || (year1 === year2 && month1 < month2) || (year1 === year2 && month1 === month2 && day1 < day2)) {
      return -1; // date1 é anterior a date2
    } else {
      return 1; // date1 é posterior a date2
    }
  }
}
