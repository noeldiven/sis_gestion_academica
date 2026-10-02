import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const connectionString = process.env['DATABASE_URL'];

if (!connectionString) {
  throw new Error('DATABASE_URL no está definida');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // =========================================================
  // ROLES
  // =========================================================

  const roles = [
    'ADMIN',
    'RECEPCIONISTA',
    'PROFESOR',
    'ESTUDIANTE',
  ];

  const roleMap: Record<string, number> = {};

  for (const name of roles) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    roleMap[name] = role.id;
  }

  console.log('✅ Roles creados');

  // =========================================================
  // CONTRASEÑAS
  // =========================================================

  const adminPassword = await bcrypt.hash(
    'Admin123*',
    10,
  );

  const profesorPassword = await bcrypt.hash(
    'Profesor123*',
    10,
  );

  const estudiantePassword = await bcrypt.hash(
    'Estudiante123*',
    10,
  );

  // =========================================================
  // ADMIN
  // =========================================================

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@sgaf.com',
    },
    update: {
      roleId: roleMap.ADMIN,
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@sgaf.com',
      password: adminPassword,
      roleId: roleMap.ADMIN,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Admin: ${admin.email}`);

  // =========================================================
  // RECEPCIONISTA
  // =========================================================

  const recepcionista = await prisma.user.upsert({
    where: {
      email: 'recepcion@sgaf.com',
    },
    update: {
      roleId: roleMap.RECEPCIONISTA,
      status: 'ACTIVE',
    },
    create: {
      email: 'recepcion@sgaf.com',
      password: adminPassword,
      roleId: roleMap.RECEPCIONISTA,
      status: 'ACTIVE',
    },
  });

  console.log(
    `✅ Recepcionista: ${recepcionista.email}`,
  );

  // =========================================================
  // PROFESOR
  // =========================================================

  const profesor = await prisma.user.upsert({
    where: {
      email: 'profesor@sgaf.com',
    },
    update: {
      roleId: roleMap.PROFESOR,
      status: 'ACTIVE',
    },
    create: {
      email: 'profesor@sgaf.com',
      password: profesorPassword,
      roleId: roleMap.PROFESOR,
      status: 'ACTIVE',
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: {
      userId: profesor.id,
    },
    update: {
      specialty: 'Ingeniería de Software',
      hireDate: new Date('2025-03-01'),
    },
    create: {
      userId: profesor.id,
      specialty: 'Ingeniería de Software',
      hireDate: new Date('2025-03-01'),
    },
  });

  console.log(`✅ Profesor: ${profesor.email}`);

  // =========================================================
  // ESTUDIANTE
  // =========================================================

  const estudiante = await prisma.user.upsert({
    where: {
      email: 'estudiante@sgaf.com',
    },
    update: {
      roleId: roleMap.ESTUDIANTE,
      status: 'ACTIVE',
    },
    create: {
      email: 'estudiante@sgaf.com',
      password: estudiantePassword,
      roleId: roleMap.ESTUDIANTE,
      status: 'ACTIVE',
    },
  });

  const student = await prisma.student.upsert({
    where: {
      userId: estudiante.id,
    },
    update: {
      enrollmentCode: 'EST-DEMO-001',
      guardianName: 'Juan Pérez',
      guardianPhone: '987654321',
    },
    create: {
      userId: estudiante.id,
      enrollmentCode: 'EST-DEMO-001',
      guardianName: 'Juan Pérez',
      guardianPhone: '987654321',
    },
  });

  console.log(
    `✅ Estudiante: ${estudiante.email}`,
  );

  // =========================================================
  // PERIODO ACADÉMICO
  // =========================================================

  const academicPeriod =
    await prisma.academicPeriod.upsert({
      where: {
        name: '2026-II',
      },
      update: {
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-12-20'),
        semesterType: 'EVEN',
        maxCredits: 24,
        regularFee: 150,
        status: 'ACTIVE',
      },
      create: {
        name: '2026-II',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-12-20'),
        semesterType: 'EVEN',
        maxCredits: 24,
        regularFee: 150,
        status: 'ACTIVE',
      },
    });

  console.log(
    `✅ Periodo académico: ${academicPeriod.name}`,
  );

  // =========================================================
  // ASIGNATURAS
  // =========================================================

  const matematica = await prisma.subject.upsert({
    where: {
      code: 'MAT101',
    },
    update: {
      name: 'Matemática I',
      credits: 4,
      semesterType: 'EVEN',
      enrollmentCost: 80,
      monthlyCost: 120,
      active: true,
    },
    create: {
      code: 'MAT101',
      name: 'Matemática I',
      credits: 4,
      semesterType: 'EVEN',
      enrollmentCost: 80,
      monthlyCost: 120,
      active: true,
    },
  });

  const programacion = await prisma.subject.upsert({
    where: {
      code: 'PROG101',
    },
    update: {
      name: 'Programación I',
      credits: 5,
      semesterType: 'EVEN',
      enrollmentCost: 100,
      monthlyCost: 150,
      active: true,
    },
    create: {
      code: 'PROG101',
      name: 'Programación I',
      credits: 5,
      semesterType: 'EVEN',
      enrollmentCost: 100,
      monthlyCost: 150,
      active: true,
    },
  });

  const comunicacion = await prisma.subject.upsert({
    where: {
      code: 'COM101',
    },
    update: {
      name: 'Comunicación I',
      credits: 3,
      semesterType: 'ODD',
      enrollmentCost: 70,
      monthlyCost: 100,
      active: true,
    },
    create: {
      code: 'COM101',
      name: 'Comunicación I',
      credits: 3,
      semesterType: 'ODD',
      enrollmentCost: 70,
      monthlyCost: 100,
      active: true,
    },
  });

  console.log('✅ Asignaturas creadas');

  // =========================================================
  // OFERTAS ACADÉMICAS
  // =========================================================

  const offeringMatematica =
    await prisma.courseOffering.upsert({
      where: {
        subjectId_academicPeriodId: {
          subjectId: matematica.id,
          academicPeriodId: academicPeriod.id,
        },
      },
      update: {
        type: 'REGULAR',
        status: 'OPEN',
      },
      create: {
        subjectId: matematica.id,
        academicPeriodId: academicPeriod.id,
        type: 'REGULAR',
        status: 'OPEN',
      },
    });

  const offeringProgramacion =
    await prisma.courseOffering.upsert({
      where: {
        subjectId_academicPeriodId: {
          subjectId: programacion.id,
          academicPeriodId: academicPeriod.id,
        },
      },
      update: {
        type: 'REGULAR',
        status: 'OPEN',
      },
      create: {
        subjectId: programacion.id,
        academicPeriodId: academicPeriod.id,
        type: 'REGULAR',
        status: 'OPEN',
      },
    });

  const offeringComunicacion =
    await prisma.courseOffering.upsert({
      where: {
        subjectId_academicPeriodId: {
          subjectId: comunicacion.id,
          academicPeriodId: academicPeriod.id,
        },
      },
      update: {
        type: 'EXTRAORDINARY',
        status: 'OPEN',
      },
      create: {
        subjectId: comunicacion.id,
        academicPeriodId: academicPeriod.id,
        type: 'EXTRAORDINARY',
        status: 'OPEN',
      },
    });

  console.log('✅ Ofertas académicas creadas');

  // =========================================================
  // GRUPOS
  // =========================================================

  const groupMatematica = await prisma.group.upsert({
    where: {
      courseOfferingId_name: {
        courseOfferingId: offeringMatematica.id,
        name: 'GRUPO A',
      },
    },
    update: {
      classroom: 'A-101',
      capacity: 30,
      teacherId: teacher.id,
      status: 'OPEN',
    },
    create: {
      courseOfferingId: offeringMatematica.id,
      name: 'GRUPO A',
      classroom: 'A-101',
      capacity: 30,
      teacherId: teacher.id,
      status: 'OPEN',
    },
  });

  const groupProgramacion = await prisma.group.upsert({
    where: {
      courseOfferingId_name: {
        courseOfferingId: offeringProgramacion.id,
        name: 'GRUPO A',
      },
    },
    update: {
      classroom: 'A-102',
      capacity: 30,
      teacherId: teacher.id,
      status: 'OPEN',
    },
    create: {
      courseOfferingId: offeringProgramacion.id,
      name: 'GRUPO A',
      classroom: 'A-102',
      capacity: 30,
      teacherId: teacher.id,
      status: 'OPEN',
    },
  });

  const groupComunicacion = await prisma.group.upsert({
    where: {
      courseOfferingId_name: {
        courseOfferingId: offeringComunicacion.id,
        name: 'GRUPO A',
      },
    },
    update: {
      classroom: 'A-103',
      capacity: 30,
      teacherId: teacher.id,
      status: 'OPEN',
    },
    create: {
      courseOfferingId: offeringComunicacion.id,
      name: 'GRUPO A',
      classroom: 'A-103',
      capacity: 30,
      teacherId: teacher.id,
      status: 'OPEN',
    },
  });

  console.log('✅ Grupos creados');

  // =========================================================
  // HORARIOS
  // =========================================================

  const schedules = [
    {
      groupId: groupMatematica.id,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '10:00',
    },
    {
      groupId: groupProgramacion.id,
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
    },
    {
      groupId: groupComunicacion.id,
      dayOfWeek: 1,
      startTime: '09:30',
      endTime: '11:30',
    },
  ];

  for (const schedule of schedules) {
    const existing = await prisma.schedule.findFirst({
      where: {
        groupId: schedule.groupId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
      },
    });

    if (existing) {
      await prisma.schedule.update({
        where: {
          id: existing.id,
        },
        data: {
          endTime: schedule.endTime,
        },
      });
    } else {
      await prisma.schedule.create({
        data: schedule,
      });
    }
  }

  console.log('✅ Horarios creados');

  console.log('');
  console.log('==========================================');
  console.log('🌱 SEED COMPLETADO CORRECTAMENTE');
  console.log('==========================================');
  console.log('');
  console.log('USUARIOS DE DEMOSTRACIÓN');
  console.log('');
  console.log('ADMIN');
  console.log('Email: admin@sgaf.com');
  console.log('Password: Admin123*');
  console.log('');
  console.log('RECEPCIONISTA');
  console.log('Email: recepcion@sgaf.com');
  console.log('Password: Admin123*');
  console.log('');
  console.log('PROFESOR');
  console.log('Email: profesor@sgaf.com');
  console.log('Password: Profesor123*');
  console.log('');
  console.log('ESTUDIANTE');
  console.log('Email: estudiante@sgaf.com');
  console.log('Password: Estudiante123*');
  console.log('');
  console.log('==========================================');
}

main()
  .catch((error) => {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
