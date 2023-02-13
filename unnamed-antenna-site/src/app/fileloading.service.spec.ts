import { TestBed } from '@angular/core/testing';

import { FileloadingService } from './fileloading.service';

describe('FileloadingService', () => {
  let service: FileloadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileloadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
