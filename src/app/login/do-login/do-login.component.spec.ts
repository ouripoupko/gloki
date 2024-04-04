import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoLoginComponent } from './do-login.component';

describe('DoLoginComponent', () => {
  let component: DoLoginComponent;
  let fixture: ComponentFixture<DoLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DoLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
