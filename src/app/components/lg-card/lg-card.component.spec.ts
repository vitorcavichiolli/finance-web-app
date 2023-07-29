import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LgCardComponent } from './lg-card.component';

describe('LgCardComponent', () => {
  let component: LgCardComponent;
  let fixture: ComponentFixture<LgCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LgCardComponent]
    });
    fixture = TestBed.createComponent(LgCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
