import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
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
  constructor(
      public dialogRef: MatDialogRef<ModalComponent>,
      private fb: FormBuilder,
      private dataService: DataService,
    ) {}
  onCloseClick(): void {
    // Close the dialog
    this.dialogRef.close();
  }

  ngOnInit() {
    
    const currentDate = new Date();
    let localDateString = this.formatDate(currentDate.toLocaleDateString());
    this.form = this.fb.group({
      tipo: new FormControl(""),
      data: new FormControl(localDateString), 
      descricao: new FormControl(""),
      pagamento: new FormControl(""),
      valor: new FormControl(""),
      categoria: new FormControl(""),
    });
    this.form.valueChanges.subscribe(this.onFormChange);

    this.tipos = tipos;
    this.pagamentos = pagamentos;
    this.categorias = categorias;
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

      const id = await this.dataService.saveMovimentacao(movimentacao);
      console.log('Movimentação criada com ID:', id);
      window.location.reload();
    }
  }
}
