import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCommunityComponent } from './new-community.component';

describe('NewCommunityComponent', () => {
  let component: NewCommunityComponent;
  let fixture: ComponentFixture<NewCommunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCommunityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
