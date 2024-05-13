import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnverifiedComponent } from './unverified.component';

describe('UnverifiedComponent', () => {
  let component: UnverifiedComponent;
  let fixture: ComponentFixture<UnverifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnverifiedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UnverifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
