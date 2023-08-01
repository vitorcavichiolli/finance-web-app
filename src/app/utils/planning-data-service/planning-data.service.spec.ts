import { TestBed } from '@angular/core/testing';

import { PlanningDataService } from './planning-data.service';

describe('PlanningDataService', () => {
  let service: PlanningDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanningDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
