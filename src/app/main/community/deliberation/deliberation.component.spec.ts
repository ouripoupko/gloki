import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliberationComponent } from './deliberation.component';

describe('DeliberationComponent', () => {
  let component: DeliberationComponent;
  let fixture: ComponentFixture<DeliberationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliberationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliberationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
