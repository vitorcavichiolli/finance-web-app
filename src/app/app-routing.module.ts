import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { PlanningComponent } from './pages/planning/planning.component';
import { RecorrenciasComponent } from './pages/recorrencias/recorrencias.component';

const routes: Routes = [
  {path:'', component: HomeComponent },
  {path:'reports', component: ReportsComponent},
  {path:'planning', component: PlanningComponent},
  {path:'recurrences', component: RecorrenciasComponent}

];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
