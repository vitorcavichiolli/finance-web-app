import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalPlanejamentoComponent } from 'src/app/components/modal-planejamento/modal-planejamento.component';
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
    private ngZone: NgZone, 
    public dialog: MatDialog,) {
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
    localStorage.setItem("movimentacoes", JSON.stringify(this.movimentacoes));
  }

  async ngAfterViewInit(): Promise<void> {
    this.cdr.detectChanges();
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


  async listarMovimentacoes(): Promise<void> {
    this.movimentacoes = await this.dataService.getAllMovimentacoes();
    const copiaMovimentacoes = [...this.movimentacoes];
    copiaMovimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    this.movimentacoes = copiaMovimentacoes;
    
  }

  onFormChange(fm:any){    
    this.dateFilterOnChange(fm);
  }

  // checkBoxFilter() {
    

  //   this.ngZone.run(() => {
  //     this.cdr.detectChanges();
  //   });
  
  // }

  dateFilterOnChange(fm:any){
    console.log(fm);
    if(this.checkEmptyNullUndefined(fm.data_ini) && this.checkEmptyNullUndefined(fm.data_fim)) {
      const dataInicial: Date = new Date(fm.data_ini);
      const dataFinal: Date = new Date(fm.data_fim);
      if(dataInicial>dataFinal){
        alert('data inicial não pode ser maior que a data final')
      }
      else{
        this.filteredMovimentacoes=this.movimentacoes.filter((movimentacao: Movimentacao) => {
          const dataMovimentacao: Date = new Date(movimentacao.data);
          return dataMovimentacao >= dataInicial && dataMovimentacao <= dataFinal;
        });
      }
    } 
    else if (!this.checkEmptyNullUndefined(fm.data_ini) && !this.checkEmptyNullUndefined(fm.data_fim)) {
      this.filteredMovimentacoes = this.movimentacoes;
    } 
    else {
      if(this.checkEmptyNullUndefined(fm.data_ini)){
        const dataInicial: Date = new Date(fm.data_ini);
        const dataFinal: Date = new Date(fm.data_fim);
        this.filteredMovimentacoes=this.movimentacoes.filter((movimentacao: Movimentacao) => {
          const dataMovimentacao: Date = new Date(movimentacao.data);
          return dataMovimentacao >= dataInicial;
        });
      }
      else{
        const dataFinal: Date = new Date(fm.data_fim);
        this.filteredMovimentacoes=this.movimentacoes.filter((movimentacao: Movimentacao) => {
          const dataMovimentacao: Date = new Date(movimentacao.data);
          return dataMovimentacao <= dataFinal;
        });
      }
    }
    this.filteredMovimentacoes = this.applyFilterByTipo(this.filteredMovimentacoes);
    this.filteredMovimentacoes = this.applyFilterByPagamento(this.filteredMovimentacoes);
    this.filteredMovimentacoes = this.applyFilterByCategoria(this.filteredMovimentacoes);
    
  }



  applyFilterByTipo(filteredMovimentacoes: Movimentacao[]): Movimentacao[] {
    const selectedTipos = this.selectedFilters.find((filter: Filters) => filter.nome === 'Tipos:');
    if (selectedTipos && selectedTipos.subFiltros) {
      const activeTipoIds = selectedTipos.subFiltros
        .filter((subFilter: Filters) => subFilter.control.value)
        .map((subFilter: Filters) => subFilter.id);
  
      if (activeTipoIds.length > 0) {
        filteredMovimentacoes = filteredMovimentacoes.filter((movimentacao: Movimentacao) =>
          activeTipoIds.includes(movimentacao.tipo)
        );
      } else {
        // If all the sub-filters of the 'Tipos:' main filter are deselected,
        // return an empty array
        filteredMovimentacoes = [];
      }
    }
  
    return filteredMovimentacoes;
  }
  
  applyFilterByPagamento(filteredMovimentacoes: Movimentacao[]): Movimentacao[] {
    const selected = this.selectedFilters.find((filter: Filters) => filter.nome === 'Pagamentos:');
    if (selected && selected.subFiltros) {
      const activeIds = selected.subFiltros
        .filter((subFilter: Filters) => subFilter.control.value)
        .map((subFilter: Filters) => subFilter.id);
  
      if (activeIds.length > 0) {
        filteredMovimentacoes = filteredMovimentacoes.filter((movimentacao: Movimentacao) =>
        activeIds.includes(movimentacao.pagamento)
        );
      } else {
        // If all the sub-filters of the 'Tipos:' main filter are deselected,
        // return an empty array
        filteredMovimentacoes = [];
      }
    }
  
    return filteredMovimentacoes;
  }
  
  applyFilterByCategoria(filteredMovimentacoes: Movimentacao[]): Movimentacao[] {
    const selected = this.selectedFilters.find((filter: Filters) => filter.nome === 'Categorias:');
    if (selected && selected.subFiltros) {
      const activeIds = selected.subFiltros
        .filter((subFilter: Filters) => subFilter.control.value)
        .map((subFilter: Filters) => subFilter.id);
  
      if (activeIds.length > 0) {
        filteredMovimentacoes = filteredMovimentacoes.filter((movimentacao: Movimentacao) =>
        activeIds.includes(movimentacao.categoria)
        );
      } else {
        // If all the sub-filters of the 'Tipos:' main filter are deselected,
        // return an empty array
        filteredMovimentacoes = [];
      }
    }
  
    return filteredMovimentacoes;
  }
  
  

  // onCheckboxChange(checkbox: Filters) {
  //   if (checkbox?.subFiltros) {
  //       const filtros = checkbox.subFiltros;
  //       filtros.forEach(el =>{
  //         const index = this.findFiltroIndex(this.selectedFilters,el);
  //         if(el.control.value == true){
  //           if(index<0){
  //             this.selectedFilters.push(el);
  //           }
  //         }
  //         else{
  //           if(index>-1){
  //             this.selectedFilters.splice(index,1);
  //           }
  //         }
  //       });
  //   }
  //   else{
  //     const index = this.findFiltroIndex(this.selectedFilters,checkbox);
  //     if(checkbox.control.value == true){
  //       if(index<0){
  //         this.selectedFilters.push(checkbox);
  //       }
  //     }
  //     else{
  //       if(index>-1){
  //         this.selectedFilters.splice(index,1);
  //       }
  //     }
  //   }
  //   this.dateFilterOnChange(this.form.value);
  // }

  onCheckboxChange(checkbox: Filters) {
    this.selectedFilters =[];
    this.selectedFilters.push(this.filtersTipo);
    this.selectedFilters.push(this.filtersCategoria);
    this.selectedFilters.push(this.filtersPagamento);

    console.log(this.selectedFilters);
    this.dateFilterOnChange(this.form.value);
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
