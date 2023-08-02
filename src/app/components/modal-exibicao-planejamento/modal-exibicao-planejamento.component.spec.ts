import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalExibicaoPlanejamentoComponent } from './modal-exibicao-planejamento.component';

describe('ModalExibicaoPlanejamentoComponent', () => {
  let component: ModalExibicaoPlanejamentoComponent;
  let fixture: ComponentFixture<ModalExibicaoPlanejamentoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalExibicaoPlanejamentoComponent]
    });
    fixture = TestBed.createComponent(ModalExibicaoPlanejamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
