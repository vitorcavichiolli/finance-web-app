import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { ItemPlanejamento, Planejamento } from 'src/app/utils/models/planejamentos.model';
import { PlanningDataService } from 'src/app/utils/planning-data-service/planning-data.service';


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
  maxPorcentagem: number= 100;
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



  ngOnInit() {
    const currentDate = new Date();
    this.form = this.fb.group({
      data_inicial: [null, Validators.required],
      data_final: [null, Validators.required],
      itens: this.fb.array([]) // Você pode adicionar os itens aqui ou através de uma função
    });

    this.itensFormArray = this.form.get('itens') as FormArray;

    this.form.valueChanges.subscribe(() => {
      this.updatePorcentagens();
    });

    this.categorias = categorias;
  }

 

  onFormChange(fm:any){
    this.updatePorcentagens();
  }

  updatePorcentagens() {
    const sliders = this.itensFormArray.controls;
    const totalPorcentagem = sliders.reduce((total, slider) => total + (slider.get('porcentagem')?.value || 0), 0);
    const diff = totalPorcentagem - this.maxPorcentagem;
  
    if (diff !== 0) {
      const slidersToUpdate = sliders.filter(slider => slider.get('porcentagem')?.value !== null);
      const slidersToUpdateCount = slidersToUpdate.length;
  
      if (slidersToUpdateCount > 0) {
        const adjustment = diff / slidersToUpdateCount;
        slidersToUpdate.forEach(slider => {
          const porcentagem = slider.get('porcentagem')?.value || 0;
          const newPorcentagem = Math.max(porcentagem - adjustment, 0);
          slider.get('porcentagem')?.setValue(newPorcentagem, { emitEvent: false });
        });
      }
    }
  }
  
  
  



  addItemFormGroup(): void  {
     const novoItem = this.fb.group({
      categoria: [''], // Defina os valores padrão desejados ou deixe em branco
      porcentagem: [null], // Aqui, você pode usar 'null' para um campo numérico vazio
    });

    this.itensFormArray.push(novoItem);
  }

  createItem(): FormGroup {
    return this.fb.group({
      categoria: [''], // Defina os valores padrão desejados ou deixe em branco
      porcentagem: [null], // Aqui, você pode usar 'null' para um campo numérico vazio
    });
  }

  addItem(): void {
    this.itensFormArray.push(this.createItem());
    // Chame a função de atualização após adicionar um novo item
    this.updatePorcentagens();
  }
  removeItem(index: number): void {
    const itensArray = this.form.get('itens') as FormArray;
    itensArray.removeAt(index);
  }
  formatDate(date: string): string {
    const [day,month,year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  async savePlanning(): Promise<void> {
    if (this.form.valid) {
      const planejamentoData: Planejamento = {
        data_inicial: this.form.value.data_inicial,
        data_final: this.form.value.data_final
      };

      const itensData: ItemPlanejamento[] = this.form.value.itens;

      try {
        const planejamentoId = await this.planningDataService.addPlanejamentoWithItems(
          planejamentoData,
          itensData
        );

        console.log('Planejamento salvo com sucesso! ID:', planejamentoId);
      } catch (error) {
        console.error('Erro ao salvar o planejamento:', error);
      }
    } else {
      console.error('Formulário inválido. Verifique os campos obrigatórios.');
    }
  }
}
