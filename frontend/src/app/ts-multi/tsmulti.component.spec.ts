import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsMultiComponent } from './tsmulti.component';

describe('TsMultiComponent', () => {
  let component: TsMultiComponent;
  let fixture: ComponentFixture<TsMultiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TsMultiComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TsMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
