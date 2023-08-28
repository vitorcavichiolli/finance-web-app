import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecorrenciasComponent } from './recorrencias.component';

describe('RecorrenciasComponent', () => {
  let component: RecorrenciasComponent;
  let fixture: ComponentFixture<RecorrenciasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecorrenciasComponent]
    });
    fixture = TestBed.createComponent(RecorrenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
