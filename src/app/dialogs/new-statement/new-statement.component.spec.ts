import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStatementComponent } from './new-statement.component';

describe('NewStatementComponent', () => {
  let component: NewStatementComponent;
  let fixture: ComponentFixture<NewStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewStatementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
