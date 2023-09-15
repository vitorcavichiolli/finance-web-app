import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { API_LOGIN } from 'src/app/utils/api/api';
import { CommonService } from 'src/app/utils/common-service/common.service';
import { LoadingService } from 'src/app/utils/loading-service/loading.service';
import { AlertDialogComponent } from '../alert-dialog/alert-dialog.component';
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
    public loadingService: LoadingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
  ){}

  ngOnInit(): void {
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      senha: ['', Validators.required],
    });
  }

  async login(){
    const requestBody = {
      usuario: this.form.value.usuario,
      senha: this.form.value.senha
    }; 
    try {
      if (this.form.valid) {
        this.loadingService.openLoading();
        const response = await this.commonService.postApi(API_LOGIN, requestBody).toPromise();
    
        const authResponse = response as LoginResponse;
        this.loadingService.closeLoading();

        if (authResponse && authResponse.token) {
          const token = authResponse.token;
          sessionStorage.setItem("token", token);
          this.dialogRef.close();
          window.location.reload();
        } else {
          const dialogRef = this.dialog.open(AlertDialogComponent, {
            data: {
              message: 'Usuário ou senha inválidos'
          }});
    
          dialogRef.afterClosed().subscribe((result: boolean) => {
          });
        }
      }
      else{
        const dialogRef = this.dialog.open(AlertDialogComponent, {
          data: {
            message: 'Preencha o usuário e senha'
        }});
  
        dialogRef.afterClosed().subscribe((result: boolean) => {
        });
      }
    } catch (error) {
      const dialogRef = this.dialog.open(AlertDialogComponent, {
        data: {
          message: 'Usuário ou senha inválidos'
      }});

      dialogRef.afterClosed().subscribe((result: boolean) => {
      });
      console.error('Erro ao fazer login:', error);
    }
  }
}
