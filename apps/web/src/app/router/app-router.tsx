import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/app-layout';
import { AuthLayout } from '../layouts/auth-layout';
import { ProtectedRoute } from './protected-route';

// Pages
import { LoginPage } from '../../features/auth/pages/login-page';
import { DashboardPage } from '../../features/dashboard/pages/dashboard-page';
import { ProjectsListPage } from '../../features/projects/pages/projects-list-page';
import { ProjectDetailPage } from '../../features/projects/pages/project-detail-page';
import { TaskBoardPage } from '../../features/tasks/pages/task-board-page';
import { TaskListPage } from '../../features/tasks/pages/task-list-page';
import { OverdueTasksPage } from '../../features/tasks/pages/overdue-tasks-page';
import { AnalyticsPage } from '../../features/analytics/pages/analytics-page';
import { RecommendationsPage } from '../../features/recommendations/pages/recommendations-page';
import { ArchivedPage } from '../../features/archived/pages/archived-page';
import { SettingsPage } from '../../features/settings/pages/settings-page';
import { NotFoundPage } from '../../shared/components/ui/not-found-page';
import { ForbiddenPage } from '../../shared/components/ui/forbidden-page';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/projects/:projectId/board" element={<TaskBoardPage />} />
            <Route path="/projects/:projectId/tasks" element={<TaskListPage />} />
            <Route path="/tasks/overdue" element={<OverdueTasksPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/archived" element={<ArchivedPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Error routes */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
