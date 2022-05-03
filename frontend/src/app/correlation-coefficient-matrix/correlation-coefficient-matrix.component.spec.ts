import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrelationCoefficientMatrixComponent } from './correlation-coefficient-matrix.component';

describe('CorrelationCoefficientMatrixComponent', () => {
  let component: CorrelationCoefficientMatrixComponent;
  let fixture: ComponentFixture<CorrelationCoefficientMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrelationCoefficientMatrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorrelationCoefficientMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
