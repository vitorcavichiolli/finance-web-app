import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPlanejamentoComponent } from './modal-planejamento.component';

describe('ModalPlanejamentoComponent', () => {
  let component: ModalPlanejamentoComponent;
  let fixture: ComponentFixture<ModalPlanejamentoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalPlanejamentoComponent]
    });
    fixture = TestBed.createComponent(ModalPlanejamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
