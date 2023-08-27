import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, contas, pagamentos, tipos } from 'src/app/utils/data/data';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { API_INSERT_MOVIMENTACAO, API_UPDATE_MOVIMENTACAO } from 'src/app/utils/api/api';
import { formatDate } from '@angular/common';

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
  contas: any;
  isEditMode = false;
  movimentacao: Movimentacao;

  constructor(
      public dialogRef: MatDialogRef<ModalComponent>,
      private fb: FormBuilder,
      
      public dialog: MatDialog,
      private commonService: CommonService,
      @Inject(MAT_DIALOG_DATA) public data: any // Obtenha os dados passados pelo modal de edição
      ) {
        this.isEditMode = data.isEditMode;
        this.movimentacao = data.movimentacao;
      }
  onCloseClick(): void {
    // Close the dialog
    this.dialogRef.close();
  }

  isTipoFieldRequired(): boolean {
    const tipoControl = this.form.get('tipo');
    return tipoControl?.errors?.['required'];
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
      conta: new FormControl(""),
    });

    this.form.valueChanges.subscribe(this.onFormChange);


    this.tipos = tipos;
    this.pagamentos = pagamentos;
    this.categorias = categorias;
    this.contas = contas;
    if (this.isEditMode) {
      const data = new Date(this.movimentacao.data);
      const valorConvertido = this.formatarValor(this.movimentacao.valor); 

      // Ajustar o formulário com os dados da movimentação a ser editada
      this.form.patchValue({
        tipo: this.movimentacao.tipo,
        data: formatDate(data, 'yyyy-MM-dd', 'en'),
        descricao: this.movimentacao.descricao,
        pagamento: this.movimentacao.pagamento,
        valor: valorConvertido,
        categoria: this.movimentacao.categoria,
        conta: this.movimentacao.conta,
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

      const valorComVirgula = formValues.valor; // Valor com vírgula
      const valorConvertido = parseFloat(valorComVirgula.replace(',', '.')); 

      const movimentacao: Movimentacao = {
        tipo: formValues.tipo,
        categoria: formValues.categoria,
        data: formValues.data,
        pagamento: formValues.pagamento,
        descricao: formValues.descricao,
        valor: valorConvertido,
        conta: formValues.conta
      };

      if (this.isEditMode && this.movimentacao.id) {
        movimentacao.id = this.movimentacao.id; // Definir o ID da movimentação no objeto atualizado
        const response = await this.commonService.putApi(API_UPDATE_MOVIMENTACAO, movimentacao).toPromise();
      } 
      else {
        try {
          const response = await this.commonService.postApi(API_INSERT_MOVIMENTACAO, movimentacao).toPromise();
          // Lógica de tratamento da resposta, se necessário
        } catch (error) {
          console.error('Erro ao inserir movimentação:', error);
        }
      }

      window.location.reload();
    }
    else{
      const dialogRef = this.dialog.open(AlertDialogComponent, {
        data: {
          message: 'Formulário invalido, preencha os campos obrigatórios',
        }
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
      });
    }
  }

  formatarValor(valor: number | string): string{
    return this.commonService.formatarValor(valor);
  }
}
