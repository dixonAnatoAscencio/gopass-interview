import { useState, useCallback } from 'react';
import { ToastContainer } from './shared/components/ui/ui-components';
import { type Toast } from './shared/components/ui/ui-components';
import { useAuthStore } from './shared/stores/auth.store';
import { LoginPage } from './features/auth/pages/login-page';
import { DashboardPage } from './features/dashboard/pages/dashboard-page';
import { ProjectsListPage } from './features/projects/pages/projects-list-page';
import { ProjectDetailPage } from './features/projects/pages/project-detail-page';
import { TaskBoardPage, KanbanBoard } from './features/tasks/pages/task-board-page';
import { TaskListPage } from './features/tasks/pages/task-list-page';
import { OverdueTasksPage } from './features/tasks/pages/overdue-tasks-page';
import { AnalyticsPage } from './features/analytics/pages/analytics-page';
import { RecommendationsPage } from './features/recommendations/pages/recommendations-page';
import { ArchivedPage } from './features/archived/pages/archived-page';
import { SettingsPage } from './features/settings/pages/settings-page';
import { TaskDrawer } from './features/tasks/components/TaskDrawer';
import { NewProjectModal, NewTaskModal } from './features/tasks/components/task-modals';
import { Page403, Page404, Page500 } from './shared/components/ui/error-pages';
import { AppShell } from './app/layouts/AppShell';
import type { MockTask } from './mock-data';
import type { AddToast } from './app/layouts/AppShell';

// Silence unused import warnings for components used only as imports per spec
void TaskBoardPage;
void KanbanBoard;

export function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [selectedProject, setSelectedProject] = useState('p1');
  const [selectedTask,   setSelectedTask]   = useState<MockTask | null>(null);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newTaskOpen,    setNewTaskOpen]    = useState(false);
  const [toasts,         setToasts]         = useState<Toast[]>([]);

  const addToast: AddToast = useCallback(({ message, type = 'info' }) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }, []);

  const openTask = useCallback((task: MockTask) => {
    setSelectedTask(task);
    setTaskDrawerOpen(true);
  }, []);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <AppShell>
        {(ctx) => {
          const { navigate, addToast: shellAddToast, currentPage } = ctx;

          // Unified addToast: use the shell's toast system
          const mergedAddToast: AddToast = shellAddToast;

          // Open task wrapper using shell's openTask but also updating local state for the drawer
          const onOpenTask = (task: MockTask) => {
            openTask(task);
          };

          const renderPage = () => {

            switch (currentPage) {
              case 'dashboard':
                return (
                  <DashboardPage
                    navigate={navigate}
                    addToast={mergedAddToast}
                    onNewTask={() => setNewTaskOpen(true)}
                    onNewProject={() => setNewProjectOpen(true)}
                  />
                );

              case 'projects':
                return (
                  <ProjectsListPage
                    navigate={(page) => {
                      if (page === 'project-detail') setSelectedProject('p1');
                      navigate(page);
                    }}
                    addToast={mergedAddToast}
                    onNewProject={() => setNewProjectOpen(true)}
                  />
                );

              case 'project-detail':
                return (
                  <ProjectDetailPage
                    projectId={selectedProject}
                    navigate={navigate}
                    addToast={mergedAddToast}
                    onOpenTask={onOpenTask}
                  />
                );

              case 'my-tasks':
                return (
                  <TaskListPage
                    navigate={navigate}
                    addToast={mergedAddToast}
                    onOpenTask={onOpenTask}
                  />
                );

              case 'overdue':
                return (
                  <OverdueTasksPage
                    navigate={navigate}
                    addToast={mergedAddToast}
                    onOpenTask={onOpenTask}
                  />
                );

              case 'analytics':
                return (
                  <AnalyticsPage
                    navigate={navigate}
                    addToast={mergedAddToast}
                  />
                );

              case 'recommendations':
                return (
                  <RecommendationsPage
                    navigate={navigate}
                    addToast={mergedAddToast}
                  />
                );

              case 'archived':
                return (
                  <ArchivedPage
                    navigate={navigate}
                    addToast={mergedAddToast}
                  />
                );

              case 'settings':
                return (
                  <SettingsPage
                    navigate={navigate}
                    addToast={mergedAddToast}
                  />
                );

              case '403':
                return <Page403 navigate={navigate} />;

              case '404':
                return <Page404 navigate={navigate} />;

              case '500':
                return <Page500 navigate={navigate} />;

              default:
                return <Page404 navigate={navigate} />;
            }
          };

          return renderPage();
        }}
      </AppShell>

      {/* Task drawer — rendered outside AppShell so it overlays the full page */}
      {taskDrawerOpen && selectedTask && (
        <TaskDrawer
          task={selectedTask}
          onClose={() => setTaskDrawerOpen(false)}
          addToast={addToast}
        />
      )}

      {/* Modals */}
      <NewProjectModal
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        addToast={addToast}
      />
      <NewTaskModal
        isOpen={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        addToast={addToast}
        defaultProjectId={selectedProject}
      />

      {/* Toast container for App-level toasts (drawer, modals) */}
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default App;
