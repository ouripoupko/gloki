import { TestBed } from '@angular/core/testing';

import { ListenService } from './listen.service';

describe('ListenService', () => {
  let service: ListenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
