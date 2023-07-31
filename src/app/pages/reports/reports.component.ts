import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, tipos } from 'src/app/utils/data/data';
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
  selectAllCategorias: boolean = true;
  selectAllTipos: boolean = true;
  movimentacoes: Movimentacao[] = [];

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

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      data_ini: [''],
      data_fim: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.listarMovimentacoes(); 
    this.carregarFiltros();
  }
  async ngAfterViewInit(): Promise<void> {
    // Após o carregamento das movimentações, atualize o componente PieChartComponent
    this.cdr.detectChanges();
  }

  async listarMovimentacoes(): Promise<void> {
    this.movimentacoes = await this.dataService.getAllMovimentacoes();
    const copiaMovimentacoes = [...this.movimentacoes];
    copiaMovimentacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    this.movimentacoes = copiaMovimentacoes;
    
    console.log('Movimentações:', this.movimentacoes);
  }

  private carregarFiltros(){
    this.filtrosCategoria();
    this.filtrosTipos();
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
    return false;
    
  }

  updateSelectAll(campo:string){
    if(campo === "categorias"){
      this.selectAllCategorias = this.filtersCategoria.subFiltros != null && this.filtersCategoria.subFiltros.every(el => el.control.value);

    }
    else if(campo === "tipos"){
      this.selectAllTipos = this.filtersTipo.subFiltros != null && this.filtersTipo.subFiltros.every(el => el.control.value);
    }
  }

  

}
