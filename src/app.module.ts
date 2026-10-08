import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RolesModule } from './roles/roles.module.js';
import { StudentsModule } from './students/students.module.js';
import { TeachersModule } from './teachers/teachers.module.js';
import { UsersModule } from './users/users.module.js';
import { AcademicPeriodsModule } from './academic-periods/academic-periods.module.js';
import { SubjectsModule } from './subjects/subjects.module.js';
import { CourseOfferingsModule } from './course-offerings/course-offerings.module.js';
import { GroupsModule } from './groups/groups.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { AssignmentsModule } from './assignments/assignments.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';
import { FinanceModule } from './finance/finance.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RolesModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    AuthModule,
    AcademicPeriodsModule,
    SubjectsModule,
    CourseOfferingsModule,
    GroupsModule,
    SchedulesModule,
    EnrollmentsModule,
    AssignmentsModule,
    SubmissionsModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}