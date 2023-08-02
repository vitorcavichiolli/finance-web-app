import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { ItemPlanejamento, Planejamento } from 'src/app/utils/models/planejamentos.model';
import { PlanningDataService } from 'src/app/utils/planning-data-service/planning-data.service';


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

  constructor(
    public dialogRef: MatDialogRef<ModalPlanejamentoComponent>,
    private fb: FormBuilder,
    private dataService: DataService,
    private planningDataService: PlanningDataService,
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
      itens: this.fb.array([]) // You can add the items here or through a function
    });

    this.itensFormArray = this.form.get('itens') as FormArray;

    this.form.valueChanges.subscribe(() => {
      this.updatePorcentagens();
    });

    this.categorias = categorias;

    if (this.isEditMode && this.planejamento) {
      // Adjust the form with the data of the Planejamento being edited
      this.form.patchValue({
        data_inicial: this.planejamento.data_inicial,
        data_final: this.planejamento.data_final,
      });

      // Populate the itensFormArray with existing data
      if(this.planejamento.id){
        let itens = this.getPlanejamentoItens(this.planejamento.id);
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
      return await this.planningDataService.getItensByPlanejamentoId(planejamentoId);
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
    if (this.form.valid) {
      const planejamentoData: Planejamento = {
        data_inicial: this.form.value.data_inicial,
        data_final: this.form.value.data_final,
      };
  
      const itensData: ItemPlanejamento[] = this.form.value.itens;
  
      if (this.isEditMode && this.planejamento.id) {
        // Planejamento is being edited, update the existing record
        const updatedPlanejamento: PlanejamentoWithItens = {
          ...planejamentoData,
          id: this.planejamento.id,
          itens: itensData,
        };
  
        try {
          await this.planningDataService.updatePlanejamentoWithItems(
            updatedPlanejamento,
            itensData
          );
  
          console.log('Planejamento atualizado com sucesso! ID:', this.planejamento.id);
          window.location.reload();
        } catch (error) {
          console.error('Erro ao atualizar o planejamento:', error);
        }
      } else {
        // Planejamento is being added as a new record
        try {
          const planejamentoId = await this.planningDataService.addPlanejamentoWithItems(
            planejamentoData,
            itensData
          );
  
          console.log('Planejamento salvo com sucesso! ID:', planejamentoId);
          window.location.reload();
        } catch (error) {
          console.error('Erro ao salvar o planejamento:', error);
        }
      }
    } else {
      alert('Formulário inválido. Verifique os campos obrigatórios.');
    }
  }
  
}
