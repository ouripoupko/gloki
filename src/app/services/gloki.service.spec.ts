import { TestBed } from '@angular/core/testing';

import { GlokiService } from './gloki.service';

describe('GlokiService', () => {
  let service: GlokiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlokiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
