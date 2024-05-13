import { TestBed } from '@angular/core/testing';

import { DeliberationService } from './deliberation.service';

describe('DeliberationService', () => {
  let service: DeliberationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliberationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
