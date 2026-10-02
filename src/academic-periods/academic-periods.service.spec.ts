import { Test, TestingModule } from '@nestjs/testing';
import { AcademicPeriodsService } from './academic-periods.service.js';

describe('AcademicPeriodsService', () => {
  let service: AcademicPeriodsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademicPeriodsService],
    }).compile();

    service = module.get<AcademicPeriodsService>(AcademicPeriodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
