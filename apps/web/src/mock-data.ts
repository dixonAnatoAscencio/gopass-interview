export interface MockUser {
  id: number;
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
}

export interface MockProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  ownerId: number;
  memberIds: number[];
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  startDate: string;
  targetDate: string;
  color: string;
  riskLevel: string;
  createdAt: string;
}

export interface ChecklistItem { id: string; text: string; done: boolean; }

export interface MockTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: string;
  priority: string;
  assigneeId: number | null;
  creatorId: number;
  dueDate: string;
  completedAt: string | null;
  tags: string[];
  comments: number;
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface MockActivity {
  id: string;
  userId: number;
  action: string;
  entity: string;
  projectId: string;
  timestamp: string;
  type: string;
}

export interface MockRecommendation {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  projectId: string | null;
  taskId: string | null;
  action: string;
  ignored: boolean;
  applied?: boolean;
}

export interface ArchivedItem {
  id: string;
  name?: string;
  title?: string;
  type: string;
  archivedAt: string;
  archivedBy: number;
  reason: string;
  originalStatus: string;
  projectId?: string;
  priority?: string;
}

export const USERS: MockUser[] = [
  { id: 1, name: 'Dixon Anato',   email: 'admin@taskflow.com',   role: 'Admin',           initials: 'DA', color: '#6366f1' },
  { id: 2, name: 'Laura Méndez', email: 'manager@taskflow.com', role: 'Project Manager',  initials: 'LM', color: '#0891b2' },
  { id: 3, name: 'Carlos Rojas', email: 'carlos@taskflow.com',  role: 'Member',           initials: 'CR', color: '#059669' },
  { id: 4, name: 'Ana Torres',   email: 'ana@taskflow.com',     role: 'Viewer',           initials: 'AT', color: '#d97706' },
  { id: 5, name: 'Mateo Gómez',  email: 'mateo@taskflow.com',   role: 'Member',           initials: 'MG', color: '#dc2626' },
];

export const PROJECTS: MockProject[] = [
  {
    id: 'p1', name: 'Portal de Clientes',
    description: 'Portal web para clientes externos con autenticación SSO, gestión de contratos y panel de métricas.',
    status: 'at_risk', progress: 62, ownerId: 2, memberIds: [1,2,3,5],
    totalTasks: 24, completedTasks: 15, overdueTasks: 4, blockedTasks: 2,
    startDate: '2026-01-15', targetDate: '2026-06-30', color: '#f59e0b', riskLevel: 'high', createdAt: '2026-01-15',
  },
  {
    id: 'p2', name: 'Plataforma Interna de Tareas',
    description: 'Sistema interno para gestión de proyectos, seguimiento de tareas y analíticas del equipo de desarrollo.',
    status: 'active', progress: 78, ownerId: 1, memberIds: [1,2,4],
    totalTasks: 18, completedTasks: 14, overdueTasks: 1, blockedTasks: 0,
    startDate: '2025-11-01', targetDate: '2026-07-15', color: '#6366f1', riskLevel: 'low', createdAt: '2025-11-01',
  },
  {
    id: 'p3', name: 'Integración con Proveedor de IA',
    description: 'Integración del asistente de IA para generación de recomendaciones inteligentes y análisis de riesgos.',
    status: 'in_progress', progress: 45, ownerId: 3, memberIds: [1,3,5],
    totalTasks: 20, completedTasks: 9, overdueTasks: 2, blockedTasks: 3,
    startDate: '2026-03-01', targetDate: '2026-08-31', color: '#8b5cf6', riskLevel: 'medium', createdAt: '2026-03-01',
  },
  {
    id: 'p4', name: 'Migración PostgreSQL',
    description: 'Migración completa de la base de datos a PostgreSQL con optimización de consultas y monitoreo.',
    status: 'active', progress: 88, ownerId: 2, memberIds: [2,3,4,5],
    totalTasks: 16, completedTasks: 14, overdueTasks: 0, blockedTasks: 1,
    startDate: '2025-12-01', targetDate: '2026-06-15', color: '#10b981', riskLevel: 'low', createdAt: '2025-12-01',
  },
];

export const TASKS: MockTask[] = [
  { id:'t1',  title:'Diseñar tablero Kanban',           description:'Crear el diseño visual del tablero Kanban con todas las columnas de estado, cards de tarea y soporte para drag & drop.',         projectId:'p2', status:'done',        priority:'high',   assigneeId:3, creatorId:1, dueDate:'2026-05-20', completedAt:'2026-05-18', tags:['UI','Design'],           comments:3, checklist:[{id:'c1',text:'Wireframe inicial',done:true},{id:'c2',text:'Prototipo alta fidelidad',done:true},{id:'c3',text:'Review con equipo',done:true}],         createdAt:'2026-05-10' },
  { id:'t2',  title:'Implementar filtros avanzados',    description:'Agregar filtros por estado, prioridad, responsable y rango de fechas en la vista de tareas con persistencia.',                   projectId:'p2', status:'in_progress', priority:'high',   assigneeId:5, creatorId:2, dueDate:'2026-06-10', completedAt:null,          tags:['Frontend','UX'],         comments:5, checklist:[{id:'c4',text:'Filtro por estado',done:true},{id:'c5',text:'Filtro por prioridad',done:true},{id:'c6',text:'Filtro por fecha',done:false}],        createdAt:'2026-05-20' },
  { id:'t3',  title:'Crear endpoint de proyectos',      description:'Implementar API REST para creación, lectura, actualización y archivado de proyectos con validaciones y tests.',                  projectId:'p1', status:'in_review',   priority:'urgent', assigneeId:3, creatorId:2, dueDate:'2026-06-05', completedAt:null,          tags:['Backend','API'],         comments:8, checklist:[{id:'c7',text:'GET /projects',done:true},{id:'c8',text:'POST /projects',done:true},{id:'c9',text:'PATCH /projects/:id',done:true},{id:'c10',text:'Tests unitarios',done:false}], createdAt:'2026-05-15' },
  { id:'t4',  title:'Revisar modelo de permisos',       description:'Validar que el modelo RBAC está correctamente implementado y cubre todos los roles: Admin, PM, Member, Viewer.',                 projectId:'p1', status:'blocked',     priority:'urgent', assigneeId:null,creatorId:1, dueDate:'2026-05-28', completedAt:null,          tags:['Security','Backend'],    comments:2, checklist:[], createdAt:'2026-05-12' },
  { id:'t5',  title:'Generar recomendaciones por reglas',description:'Implementar el motor de reglas de negocio para generar recomendaciones automáticas basadas en el estado del proyecto.',          projectId:'p3', status:'todo',        priority:'medium', assigneeId:5, creatorId:3, dueDate:'2026-07-01', completedAt:null,          tags:['AI','Backend'],          comments:1, checklist:[{id:'c11',text:'Definir reglas de negocio',done:false},{id:'c12',text:'Implementar motor',done:false}], createdAt:'2026-06-01' },
  { id:'t6',  title:'Integrar asistente de IA',         description:'Conectar la API del proveedor de IA para sugerencias inteligentes de tareas y análisis de riesgos del proyecto.',               projectId:'p3', status:'blocked',     priority:'high',   assigneeId:3, creatorId:1, dueDate:'2026-06-01', completedAt:null,          tags:['AI','Integration'],      comments:4, checklist:[{id:'c13',text:'Configurar API key',done:true},{id:'c14',text:'Implementar prompts',done:false}], createdAt:'2026-05-01' },
  { id:'t7',  title:'Optimizar consultas del dashboard', description:'Refactorizar las consultas SQL del dashboard para mejorar tiempos de carga y reducir N+1 queries.',                              projectId:'p4', status:'in_progress', priority:'medium', assigneeId:2, creatorId:2, dueDate:'2026-06-20', completedAt:null,          tags:['Database','Performance'],comments:2, checklist:[{id:'c15',text:'Análisis de queries lentas',done:true},{id:'c16',text:'Agregar índices',done:false},{id:'c17',text:'Implementar caché',done:false}], createdAt:'2026-05-25' },
  { id:'t8',  title:'Agregar historial de cambios',     description:'Implementar el tracking de cambios en tareas y proyectos para el historial de actividad del equipo.',                            projectId:'p2', status:'todo',        priority:'low',    assigneeId:4, creatorId:1, dueDate:'2026-07-10', completedAt:null,          tags:['Backend','Audit'],       comments:0, checklist:[], createdAt:'2026-06-05' },
  { id:'t9',  title:'Configurar health checks',         description:'Agregar endpoints de health check y readiness probes para monitoreo en producción con alertas.',                                  projectId:'p4', status:'done',        priority:'medium', assigneeId:5, creatorId:2, dueDate:'2026-05-30', completedAt:'2026-05-29', tags:['DevOps','Backend'],      comments:1, checklist:[{id:'c18',text:'HTTP health endpoint',done:true},{id:'c19',text:'Database health check',done:true}], createdAt:'2026-05-20' },
  { id:'t10', title:'Diseñar vista de tareas vencidas', description:'Crear la pantalla especializada para visualización y gestión de tareas vencidas con acciones rápidas.',                          projectId:'p2', status:'in_progress', priority:'high',   assigneeId:3, creatorId:2, dueDate:'2026-06-08', completedAt:null,          tags:['UI','Design'],           comments:3, checklist:[{id:'c20',text:'Wireframe',done:true},{id:'c21',text:'Diseño visual',done:false}], createdAt:'2026-05-28' },
  { id:'t11', title:'Configurar autenticación Keycloak',description:'Integrar Keycloak como proveedor de identidad SSO para autenticación empresarial con roles.',                                    projectId:'p1', status:'blocked',     priority:'urgent', assigneeId:1, creatorId:1, dueDate:'2026-06-01', completedAt:null,          tags:['Security','Auth'],       comments:6, checklist:[{id:'c22',text:'Configurar Realm',done:true},{id:'c23',text:'Setup client',done:false},{id:'c24',text:'Validar JWT',done:false}], createdAt:'2026-04-20' },
  { id:'t12', title:'Documentar API REST',              description:'Crear documentación OpenAPI/Swagger completa para todos los endpoints del sistema.',                                              projectId:'p1', status:'todo',        priority:'low',    assigneeId:null,creatorId:2, dueDate:'2026-07-15', completedAt:null,          tags:['Documentation'],         comments:0, checklist:[], createdAt:'2026-06-01' },
];

export const ACTIVITIES: MockActivity[] = [
  { id:'a1', userId:3, action:'completó la tarea',   entity:'Diseñar tablero Kanban',           projectId:'p2', timestamp:'2026-06-10T14:30:00Z', type:'task_completed' },
  { id:'a2', userId:2, action:'movió a En Revisión', entity:'Crear endpoint de proyectos',      projectId:'p1', timestamp:'2026-06-10T13:15:00Z', type:'status_changed' },
  { id:'a3', userId:1, action:'creó la tarea',       entity:'Agregar historial de cambios',     projectId:'p2', timestamp:'2026-06-10T11:00:00Z', type:'task_created' },
  { id:'a4', userId:5, action:'comentó en',          entity:'Integrar asistente de IA',         projectId:'p3', timestamp:'2026-06-09T17:45:00Z', type:'comment_added' },
  { id:'a5', userId:2, action:'marcó como Urgente',  entity:'Revisar modelo de permisos',       projectId:'p1', timestamp:'2026-06-09T16:20:00Z', type:'priority_changed' },
  { id:'a6', userId:3, action:'bloqueó la tarea',    entity:'Integrar asistente de IA',         projectId:'p3', timestamp:'2026-06-09T10:00:00Z', type:'status_changed' },
  { id:'a7', userId:5, action:'completó la tarea',   entity:'Configurar health checks',         projectId:'p4', timestamp:'2026-06-08T15:30:00Z', type:'task_completed' },
];

export const RECOMMENDATIONS: MockRecommendation[] = [
  { id:'r1', type:'overdue',    severity:'critical', title:'4 tareas urgentes vencidas',                        description:'Hay 4 tareas con prioridad urgente que superaron su fecha límite. Requieren atención inmediata.',           projectId:'p1', taskId:'t4',  action:'Ver tareas urgentes',   ignored:false },
  { id:'r2', type:'blocked',    severity:'high',     title:'Alto porcentaje de bloqueos en Portal de Clientes', description:'El proyecto tiene 2 tareas bloqueadas que representan el 8% del total y afectan el progreso.',            projectId:'p1', taskId:null,  action:'Ver tareas bloqueadas', ignored:false },
  { id:'r3', type:'unassigned', severity:'medium',   title:'2 tareas sin responsable asignado',                 description:'"Revisar modelo de permisos" y "Documentar API REST" no tienen responsable y podrían quedar sin gestión.', projectId:null, taskId:null,  action:'Asignar responsables',  ignored:false },
  { id:'r4', type:'inactive',   severity:'medium',   title:'Portal de Clientes sin actividad reciente',         description:'El proyecto no registra actividad hace 7 días, lo que podría indicar un bloqueo no reportado.',            projectId:'p1', taskId:null,  action:'Ver proyecto',          ignored:false },
  { id:'r5', type:'ai',         severity:'low',      title:'IA: dividir tarea compleja en subtareas',           description:'"Integrar asistente de IA" es demasiado grande. Considera dividirla para mejor seguimiento y entrega.',    projectId:'p3', taskId:'t6',  action:'Ver sugerencia',        ignored:false },
  { id:'r6', type:'risk',       severity:'high',     title:'Migración PostgreSQL próxima a vencer',             description:'Fecha límite el 15 de junio (5 días) y aún tiene 1 tarea bloqueada crítica pendiente.',                   projectId:'p4', taskId:null,  action:'Ver proyecto',          ignored:false },
];

export const ARCHIVED_PROJECTS: ArchivedItem[] = [
  { id:'ap1', name:'Rediseño Landing Page', type:'project', archivedAt:'2026-04-15', archivedBy:1, reason:'Proyecto completado y aprobado por stakeholders', originalStatus:'done' },
  { id:'ap2', name:'API v1 Legacy',         type:'project', archivedAt:'2026-03-01', archivedBy:2, reason:'Deprecado por nueva versión v2',                  originalStatus:'completed' },
];

export const ARCHIVED_TASKS: ArchivedItem[] = [
  { id:'at1', title:'Setup inicial del repositorio',  projectId:'p2', type:'task', archivedAt:'2026-05-01', archivedBy:1, reason:'Completada',      originalStatus:'done',     priority:'medium' },
  { id:'at2', title:'Crear wireframes v1',             projectId:'p1', type:'task', archivedAt:'2026-04-20', archivedBy:3, reason:'Superado por v2', originalStatus:'archived', priority:'low' },
  { id:'at3', title:'Análisis de requisitos iniciales',projectId:'p3', type:'task', archivedAt:'2026-04-01', archivedBy:2, reason:'Completada',      originalStatus:'done',     priority:'high' },
];

export const COMMENTS: Record<string, {id:string;userId:number;text:string;createdAt:string}[]> = {
  t3: [
    { id:'cm1', userId:2, text:'El endpoint POST ya tiene validaciones de schema. Falta agregar el test de integración con la DB.', createdAt:'2026-06-09T10:00:00Z' },
    { id:'cm2', userId:3, text:'Agregué los tests unitarios, quedan pendientes los de integración. Lo termino hoy.', createdAt:'2026-06-09T14:30:00Z' },
    { id:'cm3', userId:1, text:'Recuerden revisar los permisos de cada endpoint antes de mergear.', createdAt:'2026-06-10T09:00:00Z' },
  ],
  t6: [
    { id:'cm4', userId:3, text:'La API del proveedor tiene un rate limit de 60 req/min. Necesitamos implementar un queue.', createdAt:'2026-06-08T11:00:00Z' },
    { id:'cm5', userId:5, text:'¿Consideramos cachear las respuestas de IA por 24h para reducir costos?', createdAt:'2026-06-09T16:00:00Z' },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getUserById = (id: number | null | undefined): MockUser | null =>
  USERS.find(u => u.id === id) ?? null;

export const getProjectById = (id: string): MockProject | null =>
  PROJECTS.find(p => p.id === id) ?? null;

export const getTasksByProject = (pid: string): MockTask[] =>
  TASKS.filter(t => t.projectId === pid);

export const getOverdueTasks = (): MockTask[] => {
  const today = new Date('2026-06-10');
  return TASKS.filter(t => {
    if (t.status === 'done' || t.status === 'archived') return false;
    return new Date(t.dueDate) < today;
  });
};

export const getDaysOverdue = (dueDate: string): number => {
  const today = new Date('2026-06-10');
  const diff = Math.floor((today.getTime() - new Date(dueDate).getTime()) / 86400000);
  return Math.max(0, diff);
};

export const formatDate = (ds: string | null | undefined): string => {
  if (!ds) return '—';
  return new Date(ds).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' });
};

export const formatRelative = (ts: string): string => {
  const diffSec = Math.floor((new Date('2026-06-10T18:00:00Z').getTime() - new Date(ts).getTime()) / 1000);
  if (diffSec < 60)    return 'hace un momento';
  if (diffSec < 3600)  return `hace ${Math.floor(diffSec/60)}m`;
  if (diffSec < 86400) return `hace ${Math.floor(diffSec/3600)}h`;
  return `hace ${Math.floor(diffSec/86400)}d`;
};

export const getStatusLabel = (s: string): string =>
  ({ todo:'Pendiente', in_progress:'En progreso', blocked:'Bloqueada', in_review:'En revisión', done:'Completada', archived:'Archivada' }[s] ?? s);

export const getPriorityLabel = (p: string): string =>
  ({ low:'Baja', medium:'Media', high:'Alta', urgent:'Urgente' }[p] ?? p);

export const getProjectStatusLabel = (s: string): string =>
  ({ active:'Activo', at_risk:'En riesgo', in_progress:'En progreso', completed:'Completado', archived:'Archivado' }[s] ?? s);
