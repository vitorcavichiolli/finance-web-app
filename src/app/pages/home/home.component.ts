import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/components/modal/modal.component';
import { ModalService } from 'src/app/utils/modal-service/modal.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(public modalService: ModalService, public dialog: MatDialog){}

  openDialog() {
    // Open the Material Dialog
    const dialogRef = this.dialog.open(ModalComponent, {
    });

    // Handle dialog close event if needed
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }
}
