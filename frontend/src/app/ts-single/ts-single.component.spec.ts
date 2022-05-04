import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsSingleComponent } from './ts-single.component';

describe('TsSingleComponent', () => {
  let component: TsSingleComponent;
  let fixture: ComponentFixture<TsSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsSingleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
