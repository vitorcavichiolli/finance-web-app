import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';
import { Filters } from 'src/app/utils/models/checkboxFilter.model';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  panelOpenState = false;
  categorias: any;
  tipos:any;
  pagamentos:any;
  selectAllCategorias: boolean = true;
  selectAllTipos: boolean = true;
  selectAllPagamentos: boolean = true;
  movimentacoes: Movimentacao[] = [];
  filteredMovimentacoes: Movimentacao[] = [];
  selectedFilters:any = [];

  filtersCategoria: Filters = {
    id:"",
    nome: "",
    selecionado: true,
    cor: "primary",
    control: new FormControl(true)
  }

  filtersTipo: Filters = {
    id:"",
    nome: "",
    selecionado: true,
    cor: "primary",
    control: new FormControl(true)
  }

  filtersPagamento: Filters = {
    id:"",
    nome: "",
    selecionado: true,
    cor: "primary",
    control: new FormControl(true)
  }

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone) {
    this.form = this.fb.group({
      data_ini: [''],
      data_fim: [''],
    });
    this.onFormChange = this.onFormChange.bind(this);
    
  }

  async ngOnInit(): Promise<void> {
    await this.listarMovimentacoes(); 
    this.carregarFiltros();
    this.filteredMovimentacoes = this.movimentacoes;
    this.form.valueChanges.subscribe(this.onFormChange);
  }

  async ngAfterViewInit(): Promise<void> {
    this.cdr.detectChanges();
  }

  async listarMovimentacoes(): Promise<void> {
    this.movimentacoes = await this.dataService.getAllMovimentacoes();
    const copiaMovimentacoes = [...this.movimentacoes];
    copiaMovimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    this.movimentacoes = copiaMovimentacoes;
    
  }

  onFormChange(fm:any){    
    this.dateFilterOnChange(fm);
    this.checkBoxFilter();
  }

  checkBoxFilter(){
    const filteredByDate: Movimentacao[] = this.filterMovimentacoesByDate();

    const newFilteredMovimentacoes: Movimentacao[] = [];
    tipos.forEach(t => {
      const filtro = this.selectedFilters.find((f: any) => f.id == t.id && f.nome == t.nome);
      if (!this.checkEmptyNullUndefined(filtro)) {
        newFilteredMovimentacoes.push(...filteredByDate.filter((mov) => mov.tipo != t.id));
      } else {
        filteredByDate.forEach(mov => {
          if (mov.tipo == t.id && !newFilteredMovimentacoes.some((el) => el.id == mov.id)) {
            newFilteredMovimentacoes.push(mov);
          }
        });
      }
    });
  
    this.filteredMovimentacoes = newFilteredMovimentacoes;
  
    this.ngZone.run(() => {
      this.cdr.detectChanges();
    });
  
    console.log(this.filteredMovimentacoes);
  }

  checkBoxTiposFilter() {
    this.dateFilterOnChange(this.form);
    const newFilteredMovimentacoes: Movimentacao[] = [];
    
    tipos.forEach(t => {
      const filtro = this.selectedFilters.find((f: any) => f.id == t.id && f.nome == t.nome);
      if (!this.checkEmptyNullUndefined(filtro)) {
        newFilteredMovimentacoes.push(...this.filteredMovimentacoes.filter((mov) => mov.tipo != t.id));
      } else {
        this.movimentacoes.forEach(mov => {
          if (mov.tipo == t.id && !newFilteredMovimentacoes.some((el) => el.id == mov.id)) {
            newFilteredMovimentacoes.push(mov);
          }
        });
      }
    });
  
    this.filteredMovimentacoes = newFilteredMovimentacoes;
  
    this.ngZone.run(() => {
      this.cdr.detectChanges();
    });
  
    console.log(this.filteredMovimentacoes);
  }

  onCheckboxChange(checkbox: Filters) {
    if (checkbox?.subFiltros) {
        const filtros = checkbox.subFiltros;
        filtros.forEach(el =>{
          const index = this.findFiltroIndex(this.selectedFilters,el);
          if(el.control.value == true){
            if(index<0){
              this.selectedFilters.push(el);
            }
          }
          else{
            if(index>-1){
              this.selectedFilters.splice(index,1);
            }
          }
        });
    }
    else{
      const index = this.findFiltroIndex(this.selectedFilters,checkbox);
      if(checkbox.control.value == true){
        if(index<0){
          this.selectedFilters.push(checkbox);
        }
      }
      else{
        if(index>-1){
          this.selectedFilters.splice(index,1);
        }
      }
    }
    this.checkBoxFilter();
  }

  findFiltroIndex(array: Filters[], filter:any): number {
    for (let i = 0; i < array.length; i++) {
      const movimentacao = array[i];
      if (movimentacao.id === filter.id && movimentacao.nome === filter.nome) {
        return i; // Retorna o índice do elemento encontrado
      }
    }
    return -1; // Retorna -1 se não encontrar nenhum elemento com os valores especificados
  }

 
  dateFilterOnChange(fm: any) {
    const filteredByCheckbox: Movimentacao[] = this.filterMovimentacoesByCheckbox();
    const hasDateFilter = this.checkEmptyNullUndefined(fm.data_ini) && this.checkEmptyNullUndefined(fm.data_fim);
  
    if (hasDateFilter) {
      const dataInicial: Date = new Date(fm.data_ini);
      const dataFinal: Date = new Date(fm.data_fim);
      if (dataInicial > dataFinal) {
        alert('Data inicial não pode ser maior que a data final.');
      } else {
        this.filteredMovimentacoes = filteredByCheckbox.filter((movimentacao: Movimentacao) => {
          const dataMovimentacao: Date = new Date(movimentacao.data);
          return dataMovimentacao >= dataInicial && dataMovimentacao <= dataFinal;
        });
      }
    } else {
      this.filteredMovimentacoes = filteredByCheckbox;
    }
  }

filterMovimentacoesByDate(): Movimentacao[] {
  const { data_ini, data_fim } = this.form.value;
  if (this.checkEmptyNullUndefined(data_ini) && this.checkEmptyNullUndefined(data_fim)) {
    const dataInicial: Date = new Date(data_ini);
    const dataFinal: Date = new Date(data_fim);
    return this.movimentacoes.filter((movimentacao: Movimentacao) => {
      const dataMovimentacao: Date = new Date(movimentacao.data);
      return dataMovimentacao >= dataInicial && dataMovimentacao <= dataFinal;
    });
  } else {
    return this.movimentacoes;
  }
}
private filterMovimentacoesByCheckbox(): Movimentacao[] {
  const selectedTipos = this.selectedFilters.filter((filter: any) => filter.nome === 'Tipos:')[0];
  const selectedPagamentos = this.selectedFilters.filter((filter: any) => filter.nome === 'Pagamentos:')[0];
  const selectedCategorias = this.selectedFilters.filter((filter:  any) => filter.nome === 'Categorias:')[0];

  const filteredMovimentacoes = this.movimentacoes.filter(movimentacao => {
    const tipoMatch = !selectedTipos || selectedTipos.subFiltros.some((subFilter: { id: string; }) => subFilter.id === movimentacao.tipo);
    const pagamentoMatch = !selectedPagamentos || selectedPagamentos.subFiltros.some((subFilter: any) => subFilter.id === movimentacao.pagamento);
    const categoriaMatch = !selectedCategorias || selectedCategorias.subFiltros.some((subFilter: any) => subFilter.id === movimentacao.categoria);
    return tipoMatch && pagamentoMatch && categoriaMatch;
  });

  return filteredMovimentacoes;
}

  checkEmptyNullUndefined(value:any):boolean{
    return !(value == '' || value == null || value == undefined)
  }

  private carregarFiltros(){
    this.filtrosCategoria();
    this.filtrosTipos();
    this.filtrosPagamentos();
  }

  private filtrosCategoria(){
    this.categorias = categorias;
    let subFiltros: any = [];
    this.categorias.forEach((element: { id: { toString: () => any; }; nome: any; }) => {
      let item: Filters = {
        id: element.id.toString(),
        nome: element.nome,
        selecionado: true,
        cor: "",
        control: new FormControl(true)
      };
      subFiltros.push(item);
      this.selectedFilters.push(item);
    });
    this.filtersCategoria = {
      id: "none",
      nome: "Categorias:",
      selecionado: true,
      subFiltros: subFiltros,
      cor: "warn",
      control: new FormControl(true)
    }
  }

  private filtrosTipos(){
    this.tipos = tipos;
    let subFiltros: any = [];
    this.tipos.forEach((element: { id: { toString: () => any; }; nome: any; }) => {
      let item: Filters = {
        id: element.id.toString(),
        nome: element.nome,
        selecionado: true,
        cor: "",
        control: new FormControl(true)
      };
      subFiltros.push(item);
      this.selectedFilters.push(item);

    });
    this.filtersTipo = {
      id: "none",
      nome: "Tipos:",
      selecionado: true,
      subFiltros: subFiltros,
      cor: "warn",
      control: new FormControl(true)
    }
  }

  private filtrosPagamentos(){
    this.pagamentos = pagamentos;
    let subFiltros: any = [];
    this.pagamentos.forEach((element: { id: { toString: () => any; }; nome: any; }) => {
      let item: Filters = {
        id: element.id.toString(),
        nome: element.nome,
        selecionado: true,
        cor: "",
        control: new FormControl(true)
      };
      subFiltros.push(item);
      this.selectedFilters.push(item);

    });
    this.filtersPagamento = {
      id: "none",
      nome: "Pagamentos:",
      selecionado: true,
      subFiltros: subFiltros,
      cor: "warn",
      control: new FormControl(true)
    }

    
  }

  setAll(selected: boolean, campo:string) {
    if(campo === "categorias"){
      this.selectAllCategorias = selected;
      if (this.filtersCategoria.subFiltros == null) {
        return;
      }
      this.filtersCategoria.subFiltros.forEach((el) => {
        el.selecionado = selected;
        el.control.setValue(selected);
      });
    }
    else if(campo ==="tipos"){
      this.selectAllTipos = selected;
      if (this.filtersTipo.subFiltros == null) {
        return;
      }
      this.filtersTipo.subFiltros.forEach((el) => {
        el.selecionado = selected;
        el.control.setValue(selected);
      });
    }
    else if(campo ==="pagamentos"){
      this.selectAllPagamentos = selected;
      if (this.filtersPagamento.subFiltros == null) {
        return;
      }
      this.filtersPagamento.subFiltros.forEach((el) => {
        el.selecionado = selected;
        el.control.setValue(selected);
      });
    }
    
  }

  someSelected(campo:string): boolean {
    if(campo === "categorias"){
      if (this.filtersCategoria.subFiltros == null) {
        return false;
      }
      return this.filtersCategoria.subFiltros.filter(t => t.control.value).length > 0 && !this.selectAllCategorias;
    }
    else if(campo === "tipos"){
      if (this.filtersTipo.subFiltros == null) {
        return false;
      }
      return this.filtersTipo.subFiltros.filter(t => t.control.value).length > 0 && !this.selectAllTipos;
    }
    else if(campo === "pagamentos"){
      if (this.filtersPagamento.subFiltros == null) {
        return false;
      }
      return this.filtersPagamento.subFiltros.filter(t => t.control.value).length > 0 && !this.selectAllPagamentos;
    }
    return false;
    
  }

  updateSelectAll(campo:string){
    if(campo === "categorias"){
      this.selectAllCategorias = this.filtersCategoria.subFiltros != null && this.filtersCategoria.subFiltros.every(el => el.control.value);

    }
    else if(campo === "tipos"){
      this.selectAllTipos = this.filtersTipo.subFiltros != null && this.filtersTipo.subFiltros.every(el => el.control.value);
    }
    else if(campo === "pagamentos"){
      this.selectAllPagamentos = this.filtersPagamento.subFiltros != null && this.filtersPagamento.subFiltros.every(el => el.control.value);
    }
  }



}
