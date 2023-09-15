import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from 'src/app/components/alert-dialog/alert-dialog.component';
import { ModalPlanejamentoComponent } from 'src/app/components/modal-planejamento/modal-planejamento.component';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { API_LISTAGEM_MOVIMENTACOES } from 'src/app/utils/api/api';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, contas, pagamentos, tipos } from 'src/app/utils/data/data';
import { LoadingService } from 'src/app/utils/loading-service/loading.service';
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
  contas:any;
  pagamentos:any;
  selectAllCategorias: boolean = true;
  selectAllTipos: boolean = true;
  selectAllPagamentos: boolean = true;
  selectAllContas: boolean = true;
  excecoesCategorias = ["18"];

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

  filtersConta: Filters = {
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
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone, 
    public dialog: MatDialog,
    private commonService: CommonService,
    public loadingService: LoadingService
    ) {
    this.form = this.fb.group({
      data_ini: [''],
      data_fim: [''],
      descricaoFilter: ''
    });
    this.onFormChange = this.onFormChange.bind(this);
    
  }

  async ngOnInit(): Promise<void> {
    await this.verificaToken();
  }

  async verificaToken(){
    if(sessionStorage.getItem('token')){
      await this.listarMovimentacoes(); 
      this.filteredMovimentacoes = this.movimentacoes;
      this.carregarFiltros();
      this.form.valueChanges.subscribe(this.onFormChange);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    this.cdr.detectChanges();
  }

  openInsertModalPlanejamento() {
    const dialogRef = this.dialog.open(ModalPlanejamentoComponent, {
      data: {
        isEditMode: false
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  openInsertModalMovimentacao() {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: {
        isEditMode: false
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }


  async listarMovimentacoes(): Promise<void> {
    this.loadingService.openLoading();
    const result = await this.commonService.getApi<Movimentacao[]>(API_LISTAGEM_MOVIMENTACOES).toPromise();
    if (result !== undefined) {
      this.movimentacoes = result;
    }    
    let copiaMovimentacoes = [...this.movimentacoes];
    copiaMovimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    for (let i = 0; i < this.excecoesCategorias.length; i++) {
      // let movimentacoesaremover = copiaMovimentacoes.filter(objeto => objeto.categoria.toString() == this.excecoesCategorias[i] && objeto.tipo == 'd');
      // copiaMovimentacoes = copiaMovimentacoes.filter(objeto => !movimentacoesaremover.includes(objeto));
    }
    this.movimentacoes = copiaMovimentacoes;
    this.loadingService.closeLoading();

  }

  onFormChange(fm:any){    
    this.dateFilterOnChange(fm);
  }

  checkEmptyNullUndefined(value:any):boolean{
    return this.commonService.checkEmptyNullUndefined(value);
  }

  dateFilterOnChange(fm:any){
    if(this.checkEmptyNullUndefined(fm.data_ini) && this.checkEmptyNullUndefined(fm.data_fim)) {
      const dataInicial: Date = new Date(fm.data_ini);
      const dataFinal: Date = new Date(fm.data_fim);
      

        dataInicial.setHours(0, 0, 0, 0); // Define as horas para 00:00:00
        if (!isNaN(dataInicial.getTime())) { // Verifica se a data é válida        
          dataInicial.setDate(dataInicial.getDate() + 1);
        }
        dataFinal.setHours(0, 0, 0, 0); // Define as horas para 00:00:00
        if (!isNaN(dataFinal.getTime())) { // Verifica se a data é válida        
          dataFinal.setDate(dataFinal.getDate() + 1);
        }

      if(dataFinal != null){
        sessionStorage.setItem("dataFinalFilter", dataFinal.toDateString());
      }
      else{
        sessionStorage.removeItem("dataFinalFilter");
      }
      if(dataInicial != null){
        sessionStorage.setItem("dataIniFilter", dataInicial.toDateString());
      }
      else{
        sessionStorage.removeItem("dataIniFilter");
      }
      if(dataInicial>dataFinal){
        const dialogRef = this.dialog.open(AlertDialogComponent, {
          data: {
            message: 'A data incial não pode ser maior que a data final',
          }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
          this.form.patchValue({
            data_ini: null,
            data_fim: null
          })
        });
      }
      else{
        this.filteredMovimentacoes=this.movimentacoes.filter((movimentacao: Movimentacao) => {
          const dataMovimentacao: Date = new Date(movimentacao.data);
          return dataMovimentacao >= dataInicial && dataMovimentacao <= dataFinal;
        });
      }
    } 
    else if (!this.checkEmptyNullUndefined(fm.data_ini) && !this.checkEmptyNullUndefined(fm.data_fim)) {
      sessionStorage.removeItem("dataFinalFilter");
      sessionStorage.removeItem("dataIniFilter");
      this.filteredMovimentacoes = this.movimentacoes;
    } 
    else {
      if(this.checkEmptyNullUndefined(fm.data_ini)){
        const dataInicial: Date = new Date(fm.data_ini);
        dataInicial.setHours(0, 0, 0, 0); // Define as horas para 00:00:00
        if (!isNaN(dataInicial.getTime())) { // Verifica se a data é válida        
          dataInicial.setDate(dataInicial.getDate() + 1);
        }
        if(dataInicial != null){
          sessionStorage.setItem("dataIniFilter", dataInicial.toDateString());
        }
        else{
          sessionStorage.removeItem("dataIniFilter");
        }
        this.filteredMovimentacoes=this.movimentacoes.filter((movimentacao: Movimentacao) => {
          const dataMovimentacao: Date = new Date(movimentacao.data);
          return dataMovimentacao >= dataInicial;
        });
      }
      else{
        const dataFinal: Date = new Date(fm.data_fim);
        dataFinal.setHours(0, 0, 0, 0); // Define as horas para 00:00:00
        if (!isNaN(dataFinal.getTime())) { // Verifica se a data é válida        
          dataFinal.setDate(dataFinal.getDate() + 1);
        }
        if(dataFinal != null){
          sessionStorage.setItem("dataFinalFilter", dataFinal.toDateString());
        }
        else{
          sessionStorage.removeItem("dataFinalFilter");
        }
        sessionStorage.removeItem("dataIniFilter");
        this.filteredMovimentacoes=this.movimentacoes.filter((movimentacao: Movimentacao) => {
          const dataMovimentacao: Date = new Date(movimentacao.data);
          return dataMovimentacao <= dataFinal;
        });
      }
    }
    this.filteredMovimentacoes = this.applyFilterByTipo(this.filteredMovimentacoes);
    this.filteredMovimentacoes = this.applyFilterByPagamento(this.filteredMovimentacoes);
    this.filteredMovimentacoes = this.applyFilterByCategoria(this.filteredMovimentacoes);
    this.filteredMovimentacoes = this.applyFilterByConta(this.filteredMovimentacoes);
    this.filteredMovimentacoes = this.applyfilterByDescricao(fm, this.filteredMovimentacoes);
  }

  applyfilterByDescricao(fm: any, filteredMovimentacoes: Movimentacao[]): Movimentacao[] {
    let filtro = fm.descricaoFilter;
    if(filtro != '' && filtro != null && filtro != undefined){
      filtro = fm.descricaoFilter.toLowerCase();
      sessionStorage.setItem("descFilter", filtro);
      return filteredMovimentacoes.filter(movimentacao =>
        movimentacao.descricao.toLowerCase().includes(filtro)
      );
    }
    else{
      sessionStorage.removeItem("descFilter");
      return filteredMovimentacoes;
    }
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
        filteredMovimentacoes = [];
      }
      sessionStorage.setItem("tipoFilter", activeTipoIds);
    }
    return filteredMovimentacoes;
  }

  applyFilterByConta(filteredMovimentacoes: Movimentacao[]): Movimentacao[] {
    const selected = this.selectedFilters.find((filter: Filters) => filter.nome === 'Contas:');
    if (selected && selected.subFiltros) {
      const activeIds = selected.subFiltros
        .filter((subFilter: Filters) => subFilter.control.value)
        .map((subFilter: Filters) => subFilter.id);
  
      if (activeIds.length > 0) {
        filteredMovimentacoes = filteredMovimentacoes.filter((movimentacao: Movimentacao) => {
          return activeIds.includes(movimentacao.conta) || movimentacao.conta === '' || movimentacao.conta === undefined || movimentacao.conta === null;
        });
      } else {
        filteredMovimentacoes = [];
      }
      sessionStorage.setItem("contaFilter", activeIds);
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
        filteredMovimentacoes = [];
      }
      sessionStorage.setItem("pagamentoFilter", activeIds);

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
        filteredMovimentacoes = filteredMovimentacoes.filter((movimentacao: Movimentacao) => {
          return activeIds.includes(movimentacao.categoria.toString()) || movimentacao.categoria.toString() === '' || this.excecoesCategorias.includes(movimentacao.categoria.toString());
        });
      } else {
        filteredMovimentacoes = [];
      }
      sessionStorage.setItem("categoriaFilter", activeIds);

    }
  
    return filteredMovimentacoes;
  }
  


  onCheckboxChange(checkbox: Filters) {
    this.selectedFilters =[];
    this.selectedFilters.push(this.filtersTipo);
    this.selectedFilters.push(this.filtersCategoria);
    this.selectedFilters.push(this.filtersPagamento);
    this.selectedFilters.push(this.filtersConta);

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
  
  private carregarFiltros(){
    this.filtrosCategoria();
    this.filtrosTipos();
    this.filtrosPagamentos();
    this.filtrosContas();
    let tipoFilter = sessionStorage.getItem("tipoFilter")?.split(",") || [];
    let contaFilter = sessionStorage.getItem("contaFilter")?.split(",") || [];
    let pagamentoFilter = sessionStorage.getItem("pagamentoFilter")?.split(",") || [];
    let categoriaFilter = sessionStorage.getItem("categoriaFilter")?.split(",") || [];
    let descFilter = sessionStorage.getItem('descFilter');
    let dataFinal = sessionStorage.getItem("dataFinalFilter");
    let dataInicial = sessionStorage.getItem("dataIniFilter");

    if(dataFinal){
      let date = new Date(dataFinal).toISOString().substr(0, 10)
      this.form.patchValue({
        data_fim: date
      })
    }
    if(dataInicial){
      let date = new Date(dataInicial).toISOString().substr(0, 10)
      this.form.patchValue({
        data_ini: date
      })
    }
    if(descFilter){
      this.form.patchValue({
        descricaoFilter: descFilter
      })
    }

    if (tipoFilter && tipoFilter.length > 0 && tipoFilter[0] != '') {
      const selected = this.selectedFilters.find((filter: Filters) => filter.nome === 'Tipos:');
        if (selected.subFiltros) {
          selected.subFiltros.forEach((subFilter: Filters) => {
            if (!this.existsInsessionStorage(subFilter.id, tipoFilter)) {
              subFilter.control.setValue(false);
            }
          });
        }
    }
    if (contaFilter && contaFilter.length > 0 && contaFilter[0] != '') {
      const selected = this.selectedFilters.find((filter: Filters) => filter.nome === 'Contas:');
        if (selected.subFiltros) {
          selected.subFiltros.forEach((subFilter: Filters) => {
            if (!this.existsInsessionStorage(subFilter.id, contaFilter)) {
              subFilter.control.setValue(false);
            }
          });
        }
    }
    if (categoriaFilter && categoriaFilter.length > 0 && categoriaFilter[0] != '') {
      const selected = this.selectedFilters.find((filter: Filters) => filter.nome === 'Categorias:');
        if (selected.subFiltros) {
          selected.subFiltros.forEach((subFilter: Filters) => {
            if (!this.existsInsessionStorage(subFilter.id, categoriaFilter)) {
              subFilter.control.setValue(false);
            }
          });
        }
    }
    if (pagamentoFilter && pagamentoFilter.length > 0 && pagamentoFilter[0] != '') {
      const selected = this.selectedFilters.find((filter: Filters) => filter.nome === 'Pagamentos:');
        if (selected.subFiltros) {
          selected.subFiltros.forEach((subFilter: Filters) => {
            if (!this.existsInsessionStorage(subFilter.id, pagamentoFilter)) {
              subFilter.control.setValue(false);
            }
          });
        }
    }
    this.dateFilterOnChange(this.form.value);

  }

  private existsInsessionStorage(id: string, filter: any[]): boolean {
      return filter.includes(id);
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
      if(!this.excecoesCategorias.some(x => x == item.id)){
        subFiltros.push(item);
        //this.selectedFilters.push(item);
      }
    });
    this.filtersCategoria = {
      id: "none",
      nome: "Categorias:",
      selecionado: true,
      subFiltros: subFiltros,
      cor: "warn",
      control: new FormControl(true)
    }
    this.selectedFilters.push(this.filtersCategoria);
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
      //this.selectedFilters.push(item);

    });
    this.filtersTipo = {
      id: "none",
      nome: "Tipos:",
      selecionado: true,
      subFiltros: subFiltros,
      cor: "warn",
      control: new FormControl(true)
    }
    this.selectedFilters.push(this.filtersTipo);

  }

  private filtrosContas(){
    this.contas = contas;
    let subFiltros: any = [];
    this.contas.forEach((element: { id: { toString: () => any; }; nome: any; }) => {
      let item: Filters = {
        id: element.id.toString(),
        nome: element.nome,
        selecionado: true,
        cor: "",
        control: new FormControl(true)
      };
      subFiltros.push(item);
      //this.selectedFilters.push(item);

    });
    this.filtersConta = {
      id: "none",
      nome: "Contas:",
      selecionado: true,
      subFiltros: subFiltros,
      cor: "warn",
      control: new FormControl(true)
    }
    this.selectedFilters.push(this.filtersConta);

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
      //this.selectedFilters.push(item);

    });
    this.filtersPagamento = {
      id: "none",
      nome: "Pagamentos:",
      selecionado: true,
      subFiltros: subFiltros,
      cor: "warn",
      control: new FormControl(true)
    }
    this.selectedFilters.push(this.filtersPagamento);

    
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
    else if(campo ==="contas"){
      this.selectAllContas = selected;
      if (this.filtersConta.subFiltros == null) {
        return;
      }
      this.filtersConta.subFiltros.forEach((el) => {
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
    else if(campo === "contas"){
      if (this.filtersConta.subFiltros == null) {
        return false;
      }
      return this.filtersConta.subFiltros.filter(t => t.control.value).length > 0 && !this.selectAllContas;
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
    else if(campo === "contas"){
      this.selectAllContas = this.filtersConta.subFiltros != null && this.filtersConta.subFiltros.every(el => el.control.value);
    }
    else if(campo === "pagamentos"){
      this.selectAllPagamentos = this.filtersPagamento.subFiltros != null && this.filtersPagamento.subFiltros.every(el => el.control.value);
    }
  }



}
