import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor() { }

  showLoading: boolean = false;

  openLoading(){
    this.showLoading = true;
  }

  closeLoading(){
    this.showLoading = false;
  }

  getShowLoading(): boolean{
    return this.showLoading;
  }
}
