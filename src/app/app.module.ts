import { NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { FloatButtonComponent } from './components/float-button/float-button.component';
import { LgCardComponent } from './components/lg-card/lg-card.component';
import { ModalComponent } from './components/modal/modal.component';
import { ModalService } from './utils/modal-service/modal.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MenuComponent } from './components/menu/menu.component';
import {MatDialogModule} from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDividerModule} from '@angular/material/divider';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { TableComponent } from './components/table/table.component';
import { MatSortModule} from '@angular/material/sort';
import { MatTableModule} from '@angular/material/table';
import { MatPaginatorModule} from '@angular/material/paginator';
import { PlanningComponent } from './pages/planning/planning.component';
import { ModalPlanejamentoComponent } from './components/modal-planejamento/modal-planejamento.component';
import {MatSliderModule} from '@angular/material/slider';
import {MatTooltipModule} from '@angular/material/tooltip';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ReportsComponent,
    FloatButtonComponent,
    LgCardComponent,
    ModalComponent,
    MenuComponent,
    ConfirmationDialogComponent,
    PieChartComponent,
    TableComponent,
    PlanningComponent,
    ModalPlanejamentoComponent,
    AlertDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    HttpClientModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatSliderModule,
    MatTooltipModule
  ],
  providers: [
    ModalService,
    Location,
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
