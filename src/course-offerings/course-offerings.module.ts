import { Module } from '@nestjs/common';
import { CourseOfferingsController } from './course-offerings.controller.js';
import { CourseOfferingsService } from './course-offerings.service.js';

@Module({
  controllers: [CourseOfferingsController],
  providers: [CourseOfferingsService],
  exports: [CourseOfferingsService],
})
export class CourseOfferingsModule {}