# GoPass — Sistema de Gestión de Proyectos y Tareas

> Prueba técnica Senior Full Stack — Arquitectura monolito modular en Nx Monorepo

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Monorepo | Nx 22 |
| Frontend | React 18, Vite, TypeScript |
| Backend | NestJS 10, TypeScript |
| Worker | NestJS 10 (standalone) |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | JWT (access + refresh) + Passport |
| Estado (FE) | TanStack Query + Zustand |
| Formularios | React Hook Form + Zod |
| Docs API | Swagger / OpenAPI |
| Contenedores | Docker Compose |
| Testing | Jest (BE), Vitest (FE) |

---

## Arquitectura

### ¿Por qué Nx Monorepo?

- **DX unificado**: un solo `npm install`, un `tsconfig.base.json`, path aliases compartidos.
- **Boundaries explícitos**: `@nx/enforce-module-boundaries` previene que el frontend importe código de dominio del backend y viceversa.
- **Cache inteligente**: Nx cachea builds y tests por hash de inputs. Solo se re-ejecuta lo que cambia.
- **Escalabilidad gradual**: al tener apps y libs como unidades independientes, extraer un microservicio implica mover una lib a su propio repositorio, sin reescritura.

### ¿Por qué Monolito Modular y no Microservicios desde el inicio?

**El costo operacional de microservicios desde día cero es prohibitivo para validar un producto**:

- Service mesh, service discovery, distributed tracing, idempotencia cross-servicio, compensating transactions — todo esto antes de tener un solo usuario real es sobreingeniería.
- Un monolito bien modularizado **es** la mejor primera versión. Sus límites de contexto claros son la preparación natural para la futura extracción.

#### Evolución hacia microservicios — Strangler Fig Pattern

```
Fase 1 (actual): Monolito modular en Nx
  apps/api  →  todos los módulos en un proceso

Fase 2: Extraer Worker como servicio independiente
  apps/api     →  HTTP API
  apps/worker  →  procesa eventos via Outbox + queue

Fase 3: Extraer dominios de alta carga
  Identificar por métricas (Prometheus/Grafana) el módulo de mayor carga.
  Extraer su lib de dominio + infraestructura a un nuevo repositorio/app.
  El monolito llama al nuevo servicio vía HTTP o message broker.
  Strangler Fig: el monolito sigue respondiendo, el nuevo servicio reemplaza gradualmente.

Fase 4 (si se justifica):
  Cada dominio clave (projects, tasks, recommendations) como servicio propio.
  API Gateway por delante (Kong, Traefik).
  Event streaming (Kafka/NATS) reemplaza Outbox Pattern interno.
```

---

## Estructura del monorepo

```
gopass-interview/
├── apps/
│   ├── api/              # Backend NestJS principal
│   │   ├── prisma/       # Schema Prisma + migraciones + seed
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── config/            # ConfigModule por dominio
│   │       ├── common/            # Guards, Filters, Interceptors, Decorators
│   │       └── modules/
│   │           ├── auth/          # JWT + Passport
│   │           ├── users/
│   │           ├── projects/      # CRUD + archive/restore
│   │           ├── tasks/         # CRUD + status machine + archive
│   │           ├── analytics/
│   │           ├── recommendations/  # Rules strategy + AI fallback
│   │           ├── archived/
│   │           ├── audit/
│   │           ├── health/        # liveness + readiness
│   │           └── infrastructure/
│   │               ├── prisma/
│   │               └── outbox/
│   │
│   ├── worker/           # Worker NestJS — procesos background
│   │   └── src/modules/
│   │       ├── outbox-processor/   # Cron: procesa outbox_events
│   │       ├── overdue-tasks/      # Cron: detecta tareas vencidas
│   │       ├── recommendations-worker/
│   │       └── dlq/               # Dead Letter Queue monitor
│   │
│   └── web/              # Frontend React + Vite
│       └── src/
│           ├── app/               # Router, Providers, Layouts, Config
│           ├── features/          # Módulos por dominio (auth, projects, tasks…)
│           └── shared/            # Components, Hooks, Services, Stores
│
├── libs/
│   ├── contracts/   # DTOs, schemas Zod, tipos compartidos frontend ↔ backend
│   ├── shared/      # Utilities, constants, helpers (isOverdue, paginate…)
│   ├── domain/      # Entidades, Value Objects, Domain Events, Specifications
│   ├── application/ # Use Cases, Ports (interfaces), servicios de orquestación
│   ├── infrastructure/ # (placeholder) adaptadores técnicos reutilizables
│   ├── ui/          # Componentes React reutilizables
│   └── config/      # Configuraciones compartidas
│
├── docker-compose.yml
├── nx.json
├── tsconfig.base.json
└── README.md
```

---

## Capas de la arquitectura (Clean Architecture / DDD ligero)

```
HTTP Request
    │
    ▼
Controller          ← solo valida entrada, llama al caso de uso, mapea respuesta
    │
    ▼
Application Service / Use Case   ← orquesta, aplica reglas de aplicación, maneja transacciones
    │                               usa solo interfaces (ports), no implementaciones
    ▼
Domain              ← lógica de negocio pura: Entities, VOs, Domain Events, Specifications
    │                  sin dependencias de infraestructura
    ▼
Infrastructure      ← implementaciones concretas: Prisma, Redis, HTTP providers
    │
    ▼
PostgreSQL / Redis / AI Provider
```

**Regla de oro**: las dependencias solo apuntan hacia adentro (hacia el dominio). El dominio no conoce NestJS, Prisma ni React.

---

## Patrones aplicados

| Patrón | Dónde |
|---|---|
| Repository Pattern | `*Repository` en cada módulo de infraestructura |
| Use Case Pattern | `libs/application/src/use-cases/` |
| Domain Events | `libs/domain/src/events/` |
| Outbox Pattern | `outbox_events` table + `OutboxProcessorService` |
| Specification Pattern | `libs/domain/src/specifications/` |
| Strategy Pattern | `RecommendationsWorkerService` con estrategias intercambiables |
| Adapter Pattern | `IAiProvider` — el backend llama al puerto, la implementación es swappable |
| Dependency Inversion | `IProjectRepository`, `ITaskRepository`, `IAiProvider` — NestJS inyecta la implementación |
| Circuit Breaker | Preparado en `IAiProvider` — si falla IA, cae a estrategia por reglas |

---

## Módelos de datos (Prisma)

```
User ──────────────── ProjectMember ──────────── Project
                             │                      │
                             │                    Task[]
                             │                      │
                           role               TaskStatusHistory
                                              TaskComment
                                              Recommendation

OutboxEvent        ← eventos de dominio pendientes de procesar
IdempotencyKey     ← previene duplicación en operaciones sensibles
AuditLog           ← trazabilidad de todas las acciones
```

### Estados de tarea y transiciones válidas

```
TODO → IN_PROGRESS → BLOCKED → IN_PROGRESS
                   → IN_REVIEW → DONE → ARCHIVED
                   → DONE
                   → ARCHIVED
```

La lógica de transición vive en `TaskStatusVO` (Value Object) en `libs/domain`. El controller no valida transiciones.

---

## Instalación y arranque local

### Pre-requisitos

- Node.js 20+
- Docker y Docker Compose

### 1. Clonar e instalar

```bash
git clone https://github.com/dixonAnatoAscencio/gopass-interview.git
cd gopass-interview
npm install --legacy-peer-deps
```

### 2. Variables de entorno

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/worker/.env.example apps/worker/.env
```

Edita `apps/api/.env` y ajusta `JWT_SECRET` y `JWT_REFRESH_SECRET`.

### 3. Levantar PostgreSQL y Redis

```bash
docker compose up postgres redis -d
```

### 4. Migraciones y seed

```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas
npm run db:migrate:dev

# Datos de prueba
npm run db:seed
```

### 5. Iniciar las apps

```bash
# En terminales separadas o con nx run-many:
npm run start:api      # http://localhost:3000
npm run start:web      # http://localhost:5173
npm run start:worker   # proceso en background
```

### Swagger

`http://localhost:3000/api/docs`

---

## Scripts disponibles

```bash
# Desarrollo
npm run start:api       # API en modo dev con hot reload
npm run start:web       # Vite dev server
npm run start:worker    # Worker

# Build
npm run build:all       # Construye todas las apps

# Tests
npm test                # Todos los tests
npm run test:api        # Solo API
npm run test:web        # Solo Web

# Calidad de código
npm run lint            # ESLint en todo el monorepo
npm run lint:fix        # Autofixable
npm run format          # Prettier

# Base de datos
npm run db:generate     # Regenera el cliente Prisma
npm run db:migrate:dev  # Nueva migración (dev)
npm run db:migrate:deploy # Aplica migraciones en producción
npm run db:seed         # Carga datos de prueba
npm run db:studio       # Prisma Studio en el browser

# Nx
npx nx graph            # Visualiza el grafo del monorepo
```

---

## Credenciales de prueba (después del seed)

| Email | Password | Rol en sistema |
|---|---|---|
| dixon@gopass.dev | Password123! | ADMIN |
| laura@gopass.dev | Password123! | USER (PROJECT_MANAGER en proyectos) |
| carlos@gopass.dev | Password123! | USER (MEMBER en proyectos) |
| ana@gopass.dev | Password123! | USER (VIEWER en proyectos) |
| mateo@gopass.dev | Password123! | USER (MEMBER en proyectos) |

---

## Endpoints principales

### Auth
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

### Proyectos
```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
POST   /api/v1/projects/:id/archive
POST   /api/v1/projects/:id/restore
DELETE /api/v1/projects/:id
```

### Tareas
```
GET    /api/v1/projects/:projectId/tasks
POST   /api/v1/projects/:projectId/tasks
GET    /api/v1/tasks/:id
PATCH  /api/v1/tasks/:id
PATCH  /api/v1/tasks/:id/status
POST   /api/v1/tasks/:id/archive
POST   /api/v1/tasks/:id/restore
GET    /api/v1/tasks/overdue
```

### Analytics
```
GET    /api/v1/analytics/summary
GET    /api/v1/projects/:id/analytics
GET    /api/v1/projects/:id/dashboard
```

### Otros
```
GET    /api/v1/recommendations
GET    /api/v1/projects/:id/recommendations
POST   /api/v1/tasks/:id/ai-suggestions
GET    /api/v1/archived/projects
GET    /api/v1/archived/tasks
GET    /api/v1/audit/project/:id
GET    /api/v1/audit/task/:id
GET    /api/v1/health
GET    /api/v1/health/liveness
GET    /api/v1/health/readiness
```

---

## Observabilidad

- **Correlation ID**: cada request recibe un `x-correlation-id` generado o pasado por el cliente. Se propaga en logs y respuestas.
- **Structured logging**: `LoggingInterceptor` registra método, URL, duración y correlation ID.
- **Global error filter**: `HttpExceptionFilter` normaliza todos los errores al formato `ApiError` con `statusCode`, `message`, `timestamp`, `path` y `correlationId`.
- **Health checks**: liveness (proceso vivo) y readiness (DB accesible) diferenciados — preparados para Kubernetes probes.
- **Audit trail**: tabla `audit_logs` con `previousData`, `newData`, IP, userAgent y correlation ID.

---

## Seguridad

- **Helmet**: headers HTTP de seguridad en todas las respuestas.
- **CORS**: origen restringido a `CORS_ORIGIN`.
- **JWT con doble token**: access (15min) + refresh (7 días) con secretos separados.
- **Rate limiting**: global 100 req/min, login 10 req/min, endpoints IA 5 req/min.
- **Validación de payloads**: `ValidationPipe` global con `whitelist: true` — propiedades no declaradas en los DTOs son eliminadas automáticamente.
- **Variables de entorno validadas**: `config.validation.ts` con `class-validator` — la app no arranca si faltan variables críticas.

---

## Integración con Keycloak (roadmap)

Para integrar Keycloak como Identity Provider externo:

1. Reemplazar `LocalStrategy` por `KeycloakConnectStrategy` (`nest-keycloak-connect`).
2. El `JwtStrategy` valida tokens emitidos por Keycloak en lugar de firmarlos internamente.
3. Los roles de Keycloak se mapean a `UserRole` vía un mapper en `JwtStrategy.validate()`.
4. El seed de usuarios se migra a Keycloak Admin API o realm export.

---

## Architecture Decision Records (ADRs)

### ADR-001: Nx Monorepo

**Decisión**: Usar Nx como gestor del monorepo.

**Contexto**: El proyecto tiene frontend (React), backend (NestJS), worker y múltiples librerías compartidas. Necesitamos compartir tipos y utilidades sin duplicación ni paquetes npm privados.

**Consecuencias positivas**: Cache de builds, boundary enforcement, path aliases, generators. **Negativas**: Curva de aprendizaje inicial, dependencia de la toolchain de Nx.

---

### ADR-002: Monolito modular en lugar de microservicios

**Decisión**: Iniciar con un monolito modular con módulos NestJS bien separados.

**Contexto**: El producto está en fase de validación. El overhead operacional de microservicios (service mesh, distributed tracing, compensating transactions) no se justifica en este punto.

**Evolución**: Strangler Fig Pattern — extraer módulos a servicios cuando las métricas de carga lo justifiquen. La separación de capas facilita esta extracción sin reescritura.

---

### ADR-003: PostgreSQL como fuente de verdad

**Decisión**: PostgreSQL como única base de datos persistente. Redis como capa opcional de cache.

**Razonamiento**: ACID, soporte de JSONB para payloads de eventos, índices parciales, full-text search nativo, Prisma con soporte first-class.

---

### ADR-004: Outbox Pattern para eventos de dominio

**Decisión**: Persistir eventos de dominio en `outbox_events` dentro de la misma transacción que el cambio de estado.

**Problema que resuelve**: El problema del "dual write" — sin Outbox, si la app cae entre escribir en la DB y publicar en un message broker, el evento se pierde. Con Outbox, el worker lee y procesa los eventos pendientes de forma idempotente.

---

### ADR-005: Separar API y Worker en apps distintas

**Decisión**: El worker NestJS se ejecuta como proceso separado.

**Razones**: Escalado independiente, no bloquea el thread principal de la API con trabajo pesado, puede fallar sin afectar la API, facilita la extracción futura a un servicio propio.

---

### ADR-006: Contratos compartidos entre frontend y backend

**Decisión**: `libs/contracts` contiene DTOs, enums y schemas Zod compartidos entre ambas apps.

**Beneficio**: Un cambio en el contrato (ej. añadir un campo a `TaskDto`) genera error de TypeScript en ambos extremos inmediatamente. Sin este lib, el frontend y el backend podrían divergir silenciosamente.

---

## Roadmap técnico

- [ ] Implementar UI completa del tablero Kanban con drag & drop
- [ ] Completar vistas de proyectos, tareas y analíticas
- [ ] Agregar tests de integración con base de datos real (jest-prisma)
- [ ] Implementar `IAiProvider` con OpenAI / Anthropic + circuit breaker
- [ ] Agregar idempotency middleware para endpoints sensibles
- [ ] Implementar Redis cache para analytics y recomendaciones
- [ ] Agregar Prometheus metrics + Grafana dashboard
- [ ] Configurar CI/CD (GitHub Actions) con lint, test y build gates
- [ ] Agregar rate limiting por usuario autenticado (no solo por IP)
- [ ] Implementar notificaciones en tiempo real con WebSocket o SSE
- [ ] Migrar a Keycloak como Identity Provider externo

---

*Generado como base arquitectónica para prueba técnica Senior Full Stack — Dixon Anato, 2026*
