import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { ItemPlanejamento, Planejamento } from 'src/app/utils/models/planejamentos.model';
import { PlanningDataService } from 'src/app/utils/planning-data-service/planning-data.service';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { API_INSERT_PLANEJAMENTO, API_LISTAGEM_PLANEJAMENTOS_ITENS, API_UPDATE_PLANEJAMENTO } from 'src/app/utils/api/api';
import { formatDate } from '@angular/common';


interface PlanejamentoWithItens extends Planejamento {
  itens: ItemPlanejamento[];
}

@Component({
  selector: 'app-modal-planejamento',
  templateUrl: './modal-planejamento.component.html',
  styleUrls: ['./modal-planejamento.component.scss']
})
export class ModalPlanejamentoComponent {
  @Input() form!: FormGroup;  
  
  tipos: any;
  pagamentos: any;
  categorias: any;
  isEditMode = false;
  planejamento: Planejamento;
  maxPorcentagem: number = 100;
  itensFormArray!: FormArray;
  valorSelecionado: number = 0;
  porcentagemSelecionada: number = 0;
  constructor(
    public dialogRef: MatDialogRef<ModalPlanejamentoComponent>,
    private fb: FormBuilder,
    public dialog: MatDialog,   
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any // Obtenha os dados passados pelo modal de edição
  ) {
    this.isEditMode = data.isEditMode;
    this.planejamento = data.planejamento;
    this.updatePorcentagens = this.updatePorcentagens.bind(this);
  }

  onCloseClick(): void {
    // Close the dialog
    this.dialogRef.close();
  }

  async ngOnInit() {
    const currentDate = new Date();
    this.form = this.fb.group({
      data_inicial: [null, Validators.required],
      data_final: [null, Validators.required],
      renda: [null, Validators.required],
      itens: this.fb.array([]) // You can add the items here or through a function
    });

    this.itensFormArray = this.form.get('itens') as FormArray;

    this.form.valueChanges.subscribe(() => {
      this.updatePorcentagens();
    });

    this.categorias = categorias;

    if (this.isEditMode && this.planejamento) {
      // Adjust the form with the data of the Planejamento being edited
      const dataInicial = new Date(this.planejamento.data_inicial);
      const dataFinal = new Date(this.planejamento.data_final);
      this.form.patchValue({
        data_inicial: formatDate(dataInicial, 'yyyy-MM-dd', 'en'),
        data_final: formatDate(dataFinal, 'yyyy-MM-dd', 'en'),
        renda: this.planejamento.renda
      });

      // Populate the itensFormArray with existing data
      if(this.planejamento.id){
        let itens:ItemPlanejamento[] = [];
        const params = {id:this.planejamento.id}
        const result = await this.commonService.getApi<ItemPlanejamento[]>(API_LISTAGEM_PLANEJAMENTOS_ITENS,params).toPromise();
          if (result !== undefined) {
            itens = result;
        }        
        (await itens).forEach(element => {
          this.addItemFormGroup(element.categoria, element.porcentagem);
        });
      }
      
    }
  }

  onFormChange(fm:any) {
    this.updatePorcentagens();
  }
  async getPlanejamentoItens(planejamentoId: number) {
    try {
      // Chame o método getPlanejamentoWithItems() do serviço para obter o planejamento e seus itens
      const params = {id:planejamentoId}
      const result = await this.commonService.getApi<ItemPlanejamento[]>(API_LISTAGEM_PLANEJAMENTOS_ITENS,params).toPromise();
      return result;
    } catch (error) {
      console.error('Error fetching planejamento with items:', error);
      return [];
    }
  }
  updatePorcentagens() {
    const sliders = this.itensFormArray.controls;
    const totalPorcentagem = sliders.reduce((total, slider) => total + (slider.get('porcentagem')?.value || 0), 0);
    const diff = totalPorcentagem - this.maxPorcentagem;

    if (diff > 0) {
      // Adjust the percentage of sliders proportionally so that the total sum is equal to or less than 100%
      const totalNonNullPorcentagens = sliders.reduce((total, slider) => {
        const porcentagem = slider.get('porcentagem')?.value || 0;
        return porcentagem > 0 ? total + porcentagem : total;
      }, 0);

      sliders.forEach(slider => {
        const porcentagem = slider.get('porcentagem')?.value || 0;
        const proportionalAdjustment = (porcentagem / totalNonNullPorcentagens) * diff;
        const newPorcentagem = Math.max(porcentagem - proportionalAdjustment, 0);
        slider.get('porcentagem')?.setValue(newPorcentagem, { emitEvent: false });
      });
    }

    
  }

  sliderChange(value:string){
    this.porcentagemSelecionada = parseFloat(value);
    const renda = this.form.get('renda')?.value;
    this.valorSelecionado = (renda * this.porcentagemSelecionada) / 100;
  }

  addItemFormGroup(categoria: number, porcentagem: number): void  {
    const novoItem = this.fb.group({
      categoria: [categoria],
      porcentagem: [porcentagem],
    });

    this.itensFormArray.push(novoItem);
  }

  createItem(): FormGroup {
    return this.fb.group({
      categoria: [''],
      porcentagem: [null],
    });
  }

  addItem(): void {
    this.itensFormArray.push(this.createItem());
    // Call the update function after adding a new item
    this.updatePorcentagens();
  }

  removeItem(index: number): void {
    const itensArray = this.form.get('itens') as FormArray;
    itensArray.removeAt(index);
  }

  formatDate(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  async savePlanning(): Promise<void> {
    if(this.form.value.data_inicial > this.form.value.data_final){
      const dialogRef = this.dialog.open(AlertDialogComponent, {
        data: {
          message: 'A data incial não pode ser maior que a data final',
        }
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
        this.form.patchValue({
          data_inicial: null,
          data_final: null
        })
      });
    }
    else{
      if (this.form.valid) {
        const valorComVirgula = this.form.value.renda; // Valor com vírgula
        const valorConvertido = parseFloat(valorComVirgula.replace(',', '.')); 
        const planejamentoData: Planejamento = {
          data_inicial: this.form.value.data_inicial,
          data_final: this.form.value.data_final,
          renda: valorConvertido
        };
    
        const itensData: ItemPlanejamento[] = this.form.value.itens;
    
        const requestBody = {
          planejamento: {
            id: 0,
            data_inicial: planejamentoData.data_inicial,
            data_final:  planejamentoData.data_final,
            renda: planejamentoData.renda 
          },
          itens: itensData
        };
        
        if (this.isEditMode && this.planejamento.id) {
          requestBody.planejamento.id = this.planejamento.id;
          try {
            const response = await this.commonService.putApi(API_UPDATE_PLANEJAMENTO, requestBody).toPromise();
            window.location.reload();
          } catch (error) {
            console.error('Erro ao atualizar o planejamento:', error);
          }
        } else {
          try {
            const response = await this.commonService.postApi(API_INSERT_PLANEJAMENTO, requestBody).toPromise();
            window.location.reload();
          } catch (error) {
            console.error('Erro ao salvar o planejamento:', error);
          }
        }
      } else {
        const dialogRef = this.dialog.open(AlertDialogComponent, {
          data: {
            message: 'Formulário invalido, preencha os campos obrigatórios',
          }
        });

        dialogRef.afterClosed().subscribe((result: boolean) => {
        });
      }
    }
  }

  formatarValor(valor: number | string): string{
    return this.commonService.formatarValor(valor);
  }
  
}
