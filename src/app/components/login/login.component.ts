import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { API_LOGIN } from 'src/app/utils/api/api';
import { CommonService } from 'src/app/utils/common-service/common.service';
interface LoginResponse {
  token: string;
  // Outras propriedades, se houver
}
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @Input() form!: FormGroup;  
  usuario:string = '';
  senha: string = '';
  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private fb: FormBuilder,
    public dialog: MatDialog,   
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){}

  ngOnInit(): void {
    this.form = this.fb.group({
      usuario: '',
      senha: '',
    });
  }

  async login(){
    const requestBody = {
      usuario: this.form.value.usuario,
      senha: this.form.value.senha
    }; 
    try {
      const response = await this.commonService.postApi(API_LOGIN, requestBody).toPromise();
  
      const authResponse = response as LoginResponse;
  
      if (authResponse && authResponse.token) {
        const token = authResponse.token;
        sessionStorage.setItem("token", token);
        this.dialogRef.close();
        window.location.reload();
      } else {
        console.error('Erro de autenticação');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  }
}
