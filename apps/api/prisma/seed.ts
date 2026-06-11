import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  const [dixon, laura, carlos, ana, mateo] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'dixon@gopass.dev' },
      update: {},
      create: {
        email: 'dixon@gopass.dev',
        name: 'Dixon Anato',
        passwordHash,
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'laura@gopass.dev' },
      update: {},
      create: {
        email: 'laura@gopass.dev',
        name: 'Laura Méndez',
        passwordHash,
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'carlos@gopass.dev' },
      update: {},
      create: {
        email: 'carlos@gopass.dev',
        name: 'Carlos Rojas',
        passwordHash,
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana@gopass.dev' },
      update: {},
      create: {
        email: 'ana@gopass.dev',
        name: 'Ana Torres',
        passwordHash,
        role: 'USER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'mateo@gopass.dev' },
      update: {},
      create: {
        email: 'mateo@gopass.dev',
        name: 'Mateo Gómez',
        passwordHash,
        role: 'USER',
      },
    }),
  ]);

  console.log('✅ Users created');

  // ─── Projects ─────────────────────────────────────────────────────────────
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'proj-portal-clientes' },
      update: {},
      create: {
        id: 'proj-portal-clientes',
        name: 'Portal de Clientes',
        description: 'Portal web para gestión de clientes y sus servicios.',
        color: '#6366f1',
        ownerId: dixon.id,
        members: {
          createMany: {
            data: [
              { userId: dixon.id, role: 'ADMIN' },
              { userId: laura.id, role: 'PROJECT_MANAGER' },
              { userId: carlos.id, role: 'MEMBER' },
              { userId: ana.id, role: 'VIEWER' },
            ],
            skipDuplicates: true,
          },
        },
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-plataforma-interna' },
      update: {},
      create: {
        id: 'proj-plataforma-interna',
        name: 'Plataforma Interna de Tareas',
        description: 'Sistema interno de gestión de proyectos y tareas del equipo.',
        color: '#10b981',
        ownerId: laura.id,
        members: {
          createMany: {
            data: [
              { userId: laura.id, role: 'ADMIN' },
              { userId: dixon.id, role: 'PROJECT_MANAGER' },
              { userId: mateo.id, role: 'MEMBER' },
              { userId: carlos.id, role: 'MEMBER' },
            ],
            skipDuplicates: true,
          },
        },
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-integracion-ia' },
      update: {},
      create: {
        id: 'proj-integracion-ia',
        name: 'Integración con Proveedor de IA',
        description: 'Integración de modelos de IA para recomendaciones y automatización.',
        color: '#f59e0b',
        ownerId: dixon.id,
        members: {
          createMany: {
            data: [
              { userId: dixon.id, role: 'ADMIN' },
              { userId: mateo.id, role: 'MEMBER' },
            ],
            skipDuplicates: true,
          },
        },
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-migracion-pg' },
      update: {},
      create: {
        id: 'proj-migracion-pg',
        name: 'Migración PostgreSQL',
        description: 'Migración y optimización de esquemas PostgreSQL para producción.',
        color: '#ef4444',
        ownerId: carlos.id,
        members: {
          createMany: {
            data: [
              { userId: carlos.id, role: 'ADMIN' },
              { userId: dixon.id, role: 'MEMBER' },
              { userId: laura.id, role: 'VIEWER' },
            ],
            skipDuplicates: true,
          },
        },
      },
    }),
  ]);

  console.log('✅ Projects created');

  // ─── Tasks ────────────────────────────────────────────────────────────────
  const portalProject = projects[0];
  const plataformaProject = projects[1];
  const iaProject = projects[2];
  const migracionProject = projects[3];

  const taskSeed = [
    {
      id: 'task-01',
      title: 'Diseñar tablero Kanban',
      description: 'Crear el diseño UX/UI del tablero Kanban con drag & drop.',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      projectId: portalProject.id,
      assigneeId: laura.id,
      createdById: dixon.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // overdue
      tags: ['ui', 'kanban'],
    },
    {
      id: 'task-02',
      title: 'Implementar filtros avanzados',
      description: 'Filtros por estado, prioridad, responsable y fecha en listado de tareas.',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      projectId: portalProject.id,
      assigneeId: carlos.id,
      createdById: dixon.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: ['backend', 'filters'],
    },
    {
      id: 'task-03',
      title: 'Crear endpoint de proyectos',
      description: 'Implementar CRUD completo para proyectos con paginación.',
      status: 'IN_REVIEW' as const,
      priority: 'HIGH' as const,
      projectId: plataformaProject.id,
      assigneeId: carlos.id,
      createdById: laura.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      tags: ['api', 'projects'],
    },
    {
      id: 'task-04',
      title: 'Revisar modelo de permisos',
      description: 'Auditar y refinar el modelo de roles y permisos por proyecto.',
      status: 'BLOCKED' as const,
      priority: 'URGENT' as const,
      projectId: plataformaProject.id,
      assigneeId: dixon.id,
      createdById: laura.id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // overdue
      tags: ['security', 'permissions'],
    },
    {
      id: 'task-05',
      title: 'Generar recomendaciones por reglas',
      description: 'Implementar motor de recomendaciones basado en reglas de negocio.',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      projectId: iaProject.id,
      assigneeId: mateo.id,
      createdById: dixon.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      tags: ['recommendations', 'rules'],
    },
    {
      id: 'task-06',
      title: 'Integrar asistente de IA',
      description: 'Conectar con proveedor de IA externo para sugerencias de tareas.',
      status: 'TODO' as const,
      priority: 'HIGH' as const,
      projectId: iaProject.id,
      assigneeId: dixon.id,
      createdById: dixon.id,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      tags: ['ai', 'integration'],
    },
    {
      id: 'task-07',
      title: 'Optimizar consultas del dashboard',
      description: 'Mejorar performance de queries para el dashboard con índices y caching.',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      projectId: migracionProject.id,
      assigneeId: carlos.id,
      createdById: carlos.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      tags: ['performance', 'database'],
    },
    {
      id: 'task-08',
      title: 'Agregar historial de cambios',
      description: 'Implementar tracking de cambios de estado en tareas con comentarios.',
      status: 'DONE' as const,
      priority: 'MEDIUM' as const,
      projectId: plataformaProject.id,
      assigneeId: mateo.id,
      createdById: laura.id,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['audit', 'history'],
    },
    {
      id: 'task-09',
      title: 'Configurar health checks',
      description: 'Implementar liveness y readiness probes para Kubernetes.',
      status: 'DONE' as const,
      priority: 'LOW' as const,
      projectId: plataformaProject.id,
      assigneeId: dixon.id,
      createdById: dixon.id,
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['devops', 'health'],
    },
    {
      id: 'task-10',
      title: 'Diseñar vista de tareas vencidas',
      description: 'Crear la vista de listado y gestión de tareas vencidas en el frontend.',
      status: 'TODO' as const,
      priority: 'URGENT' as const,
      projectId: portalProject.id,
      assigneeId: laura.id,
      createdById: dixon.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      tags: ['frontend', 'overdue'],
    },
  ];

  for (const task of taskSeed) {
    const { completedAt, ...rest } = task;
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        ...rest,
        completedAt: completedAt ?? null,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: 'TODO',
            changedById: task.createdById,
          },
        },
      },
    });
  }

  console.log('✅ Tasks created');
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📧 Test credentials:');
  console.log('   dixon@gopass.dev  / Password123! (ADMIN)');
  console.log('   laura@gopass.dev  / Password123! (USER)');
  console.log('   carlos@gopass.dev / Password123! (USER)');
  console.log('   ana@gopass.dev    / Password123! (USER)');
  console.log('   mateo@gopass.dev  / Password123! (USER)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
