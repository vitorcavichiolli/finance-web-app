import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { appPages } from 'src/app/utils/pages/pages';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit{
  constructor(private router: Router){}
  pages: any;
  ngOnInit() {
    this.pages = appPages;
  }

  redirect(pageName:string){
    this.router.navigate([`${pageName}`])
  }

  isPathEqual(path:string):boolean{
    return this.router.url === path;
  }
}
