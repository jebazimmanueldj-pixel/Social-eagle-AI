import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import Customer360Page from "../pages/Customer360Page";
import CustomerListPage from "../pages/CustomerListPage";
import Account360Page from "../pages/Account360Page";
import AccountListPage from "../pages/AccountListPage";
import TransactionExplorerPage from "../pages/TransactionExplorerPage";
import AMLAlertPage from "../pages/AMLAlertPage";
import PositiveAlertPage from "../pages/PositiveAlertPage";
import NegativeAlertPage from "../pages/NegativeAlertPage";
import STRGenerationPage from "../pages/STRGenerationPage";
import CTRReportPage from "../pages/CTRReportPage";
import DormantAccountPage from "../pages/DormantAccountPage";
import LOSDataMartPage from "../pages/LOSDataMartPage";
import DataCataloguePage from "../pages/DataCataloguePage";
import AIQueryAssistantPage from "../pages/AIQueryAssistantPage";
import QueryBuilderPage from "../pages/QueryBuilderPage";
import DataQualityPage from "../pages/DataQualityPage";
import MetadataLineagePage from "../pages/MetadataLineagePage";
import ETLJobMonitorPage from "../pages/ETLJobMonitorPage";
import ReportLibraryPage from "../pages/ReportLibraryPage";
import AuditTrailPage from "../pages/AuditTrailPage";
import UserAccessManagementPage from "../pages/UserAccessManagementPage";
import SettingsPage from "../pages/SettingsPage";

import { useAuthStore } from "../store/auth";

function Protected({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/customers/:id" element={<Customer360Page />} />
        <Route path="/accounts" element={<AccountListPage />} />
        <Route path="/accounts/:id" element={<Account360Page />} />
        <Route path="/transactions" element={<TransactionExplorerPage />} />
        <Route path="/alerts" element={<AMLAlertPage />} />
        <Route path="/positive-alerts" element={<PositiveAlertPage />} />
        <Route path="/negative-alerts" element={<NegativeAlertPage />} />
        <Route path="/str" element={<STRGenerationPage />} />
        <Route path="/ctr" element={<CTRReportPage />} />
        <Route path="/dormant" element={<DormantAccountPage />} />
        <Route path="/los" element={<LOSDataMartPage />} />
        <Route path="/catalogue" element={<DataCataloguePage />} />
        <Route path="/ai" element={<AIQueryAssistantPage />} />
        <Route path="/query-builder" element={<QueryBuilderPage />} />
        <Route path="/data-quality" element={<DataQualityPage />} />
        <Route path="/lineage" element={<MetadataLineagePage />} />
        <Route path="/etl" element={<ETLJobMonitorPage />} />
        <Route path="/reports" element={<ReportLibraryPage />} />
        <Route path="/audit" element={<AuditTrailPage />} />
        <Route path="/users" element={<UserAccessManagementPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
