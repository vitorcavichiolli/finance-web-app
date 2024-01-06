import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/utils/data-service/data.service';
import { categorias, contas, pagamentos, tipos } from 'src/app/utils/data/data';
import { Movimentacao } from 'src/app/utils/models/movimentacao.model';
import { Recorrencia } from 'src/app/utils/models/recorrencia.model';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { API_DELETE_RECORRENCIA, API_INSERT_MOVIMENTACAO, API_INSERT_RECORRENCIA, API_LISTAGEM_RECORRENCIA_BY_MOVIMENTACAO, API_UPDATE_MOVIMENTACAO, API_UPDATE_RECORRENCIA } from 'src/app/utils/api/api';
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
  recorrencia: Recorrencia = {
    id_movimentacao: 0,
    id:0,
    tem_limite: false,
    repeticao:0,
    parcelas_exibicao:0
  };

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

  async ngOnInit() {
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
      recorrencia: new FormControl(false),
      limite: new FormControl(true),
      repeticao: new FormControl(0),

    });

    this.form.valueChanges.subscribe(this.onFormChange);


    this.tipos = tipos;
    this.pagamentos = pagamentos;
    this.categorias = categorias;
    this.contas = contas;
    if (this.isEditMode) {
      const data = new Date(this.movimentacao.data);
      const valorConvertido = this.formatarValor(this.movimentacao.valor); 
     
      if(this.movimentacao.recorrencia == true){
        this.recorrencia = await this.getRecorrencia(this.movimentacao.id!)
      }
      this.form.patchValue({
        tipo: this.movimentacao.tipo,
        data: formatDate(data, 'yyyy-MM-dd', 'en'),
        descricao: this.movimentacao.descricao,
        pagamento: this.movimentacao.pagamento,
        valor: valorConvertido,
        categoria: this.movimentacao.categoria,
        conta: this.movimentacao.conta,
        recorrencia: this.recorrencia != null ? Boolean(this.movimentacao.recorrencia) : false,
        limite: this.recorrencia != null ? Boolean(this.recorrencia.tem_limite) : false,
        repeticao: this.recorrencia != null ? this.recorrencia.repeticao : 0
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

      const valorComVirgula = formValues.valor; 
      const valorConvertido = parseFloat(valorComVirgula.replace('.','').replace(',', '.')); 

      const movimentacao: Movimentacao = {
        tipo: formValues.tipo,
        categoria: formValues.categoria,
        data: formValues.data,
        pagamento: formValues.pagamento,
        descricao: formValues.descricao,
        valor: valorConvertido,
        conta: formValues.conta,
        recorrencia: formValues.recorrencia
      };

      if (this.isEditMode && this.movimentacao.id) {
        movimentacao.id = this.movimentacao.id; 
        const response = await this.commonService.putApi(API_UPDATE_MOVIMENTACAO, movimentacao).toPromise();
        if(movimentacao.recorrencia){
          const recorrencia: Recorrencia = {
            id_movimentacao: movimentacao.id!,
            tem_limite: formValues.limite,
            repeticao: parseInt(formValues.repeticao) - 1, // menos um pela movimentação inicial ja cadastrada
            parcelas_exibicao: parseInt(formValues.repeticao),
            id: 0
          }
          this.salvarRecorrencia(recorrencia);
        }
        else{
          if(this.recorrencia != null){
            if(this.recorrencia.id != 0 && this.recorrencia.id != null && this.recorrencia.id != undefined){
              await this.deleteRecorrencia(this.recorrencia.id);
            }
          }
          window.location.reload();
        }
      } 
      else {
        try {
          const response = await this.commonService.postApi(API_INSERT_MOVIMENTACAO, movimentacao).toPromise();
          let id = null;
          if (response && typeof response === "object" && "message" in response) {
            id = response["message"];
          }
          
          const recorrencia: Recorrencia = {
            id_movimentacao: parseInt(id + ""),
            tem_limite: formValues.limite,
            repeticao: parseInt(formValues.repeticao) - 1, // menos um pela movimentação inicial ja cadastrada
            parcelas_exibicao: parseInt(formValues.repeticao)
          }
          if(movimentacao.recorrencia){
            this.salvarRecorrencia(recorrencia);
          }
          else{
            window.location.reload();
          }
        } catch (error) {
          console.error('Erro ao inserir movimentação:', error);
        }
      }

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

  async salvarRecorrencia(recorrencia: Recorrencia): Promise<void> {
      try {
        var existe = this.recorrencia = await this.getRecorrencia(recorrencia.id_movimentacao);

        if (this.isEditMode && this.movimentacao.id && existe != null) {
          const response = await this.commonService.putApi(API_UPDATE_RECORRENCIA, recorrencia).toPromise();
        }
        else{
          const response = await this.commonService.postApi(API_INSERT_RECORRENCIA, recorrencia).toPromise();
        }
      } catch (error) {
        console.error('Erro ao inserir recorrencia:', error);
      }
      
      window.location.reload();
    
   
  }

  private async deleteRecorrencia(id: number){
    try {
      const response = await this.commonService.postApi(API_DELETE_RECORRENCIA, id).toPromise();
    } catch (error) {
      console.error('Erro ao atualizar recorrencia:', error);
    }
  }

  async getRecorrencia(movimentacao: number): Promise<Recorrencia> {
    
      const params = {id: movimentacao}
      const result = await this.commonService.getApi<Recorrencia>(API_LISTAGEM_RECORRENCIA_BY_MOVIMENTACAO,params).toPromise();
      
      return result!;
    
  }

  formatarValor(valor: number | string): string{
    return this.commonService.formatarValor(valor);
  }
}
