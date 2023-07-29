import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/app/utils/modal-service/modal.service';

@Component({
  selector: 'app-float-button',
  templateUrl: './float-button.component.html',
  styleUrls: ['./float-button.component.scss']
})
export class FloatButtonComponent implements OnInit {

  constructor(private modalService: ModalService) { }
  @Output() buttonClicked = new EventEmitter<void>();
  ngOnInit() {}
  onClick(): void {
    this.buttonClicked.emit();
  }
}
