import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { categorias, pagamentos, tipos } from 'src/app/utils/data/data';

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
}
