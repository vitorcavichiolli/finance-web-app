import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit{
  form: FormGroup = new FormGroup({});
  tipos: any;
  pagamentos: any;
  categorias: any;
  isEditMode = false;
  movimentacao: Movimentacao;

  constructor(
      public dialogRef: MatDialogRef<ModalComponent>,
      private fb: FormBuilder,
      private dataService: DataService,
      @Inject(MAT_DIALOG_DATA) public data: any // Obtenha os dados passados pelo modal de edição
      ) {
        this.isEditMode = data.isEditMode;
        this.movimentacao = data.movimentacao;
      }
  onCloseClick(): void {
    // Close the dialog
    this.dialogRef.close();
  }



  ngOnInit() {
    const currentDate = new Date();
    let localDateString = this.formatDate(currentDate.toLocaleDateString());
    this.form = this.fb.group({
      tipo: new FormControl("d", Validators.required),
      data: new FormControl(localDateString, Validators.required),
      descricao: new FormControl("", Validators.required),
      pagamento: new FormControl("", Validators.required),
      valor: new FormControl("", Validators.required),
      categoria: new FormControl(""),
    });

    this.form.valueChanges.subscribe(this.onFormChange);


    this.tipos = tipos;
    this.pagamentos = pagamentos;
    this.categorias = categorias;

    if (this.isEditMode) {
      // Ajustar o formulário com os dados da movimentação a ser editada
      this.form.patchValue({
        tipo: this.movimentacao.tipo,
        data: this.movimentacao.data,
        descricao: this.movimentacao.descricao,
        pagamento: this.movimentacao.pagamento,
        valor: this.movimentacao.valor,
        categoria: this.movimentacao.categoria,
      });
    }
  }

  onFormChange(fm:any){


  }

  formatDate(date: string): string {
    const [day,month,year] = date.split('/');
    return `${year}-${month}-${day}`;
  }

  async salvarMovimentacao(): Promise<void> {
    if(this.form.valid){
      const formValues = this.form.value;
      const movimentacao: Movimentacao = {
        tipo: formValues.tipo,
        categoria: formValues.categoria,
        data: formValues.data,
        pagamento: formValues.pagamento,
        descricao: formValues.descricao,
        valor: formValues.valor
      };

      if (this.isEditMode && this.movimentacao.id) {
        movimentacao.id = this.movimentacao.id; // Definir o ID da movimentação no objeto atualizado
        await this.dataService.updateMovimentacao(movimentacao);
        console.log('Movimentação atualizada com sucesso!');
      } else {
        const id = await this.dataService.saveMovimentacao(movimentacao);
        console.log('Movimentação criada com ID:', id);
      }

      window.location.reload();
    }
  }
}
