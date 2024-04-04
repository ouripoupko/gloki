import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlokiComponent } from './gloki.component';

describe('GlokiComponent', () => {
  let component: GlokiComponent;
  let fixture: ComponentFixture<GlokiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlokiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlokiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
