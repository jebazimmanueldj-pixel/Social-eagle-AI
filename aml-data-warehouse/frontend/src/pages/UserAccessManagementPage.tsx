import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import PageTitle from "../components/common/PageTitle";
import DataTable, { Column } from "../components/common/DataTable";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import { userApi } from "../services";
import { mockUsers, mockRoles } from "../mock-data";
import { AppUser, Role } from "../types";

export default function UserAccessManagementPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"users" | "roles">("users");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    username: "", fullName: "", email: "", password: "Aml@12345",
    branchCode: "BR-MUM-01", department: "AML", roles: ["AML_ANALYST"] as string[],
  });

  const users = useQuery({
    queryKey: ["users"], queryFn: userApi.list, placeholderData: mockUsers as AppUser[],
  });
  const roles = useQuery({
    queryKey: ["roles"], queryFn: userApi.roles, placeholderData: mockRoles as Role[],
  });

  const userCols: Column<AppUser>[] = [
    { key: "username",   header: "Username" },
    { key: "fullName",   header: "Full name" },
    { key: "email",      header: "Email" },
    { key: "branchCode", header: "Branch" },
    { key: "department", header: "Department" },
    { key: "roles",      header: "Roles",
      render: (u) => <span className="space-x-1">
        {u.roles.map((r) => <span key={r} className="badge bg-bank-50 text-bank-600 ring-bank-500/20">{r}</span>)}
      </span> },
    { key: "active",     header: "Active",
      render: (u) => u.active ? <StatusBadge value="ACTIVE" /> : <StatusBadge value="CLOSED" /> },
  ];

  const roleCols: Column<Role>[] = [
    { key: "roleCode",   header: "Code" },
    { key: "roleName",   header: "Name" },
    { key: "description",header: "Description" },
  ];

  const submit = async () => {
    try {
      // Backend accepts a JSON array for Set<String>
      await userApi.create({ ...form });
      toast.success("User created (default password: Aml@12345)");
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Create failed");
    }
  };

  return (
    <>
      <PageTitle
        title="User Access Management"
        subtitle="Users, roles, permissions, module access and field-level access"
        actions={tab === "users" && <button className="btn-primary" onClick={() => setCreateOpen(true)}>New user</button>}
      />

      <div className="card-pad mb-3 flex gap-2">
        <button onClick={() => setTab("users")} className={tab === "users" ? "btn-primary" : "btn-secondary"}>Users</button>
        <button onClick={() => setTab("roles")} className={tab === "roles" ? "btn-primary" : "btn-secondary"}>Roles</button>
      </div>

      {tab === "users" && (
        <DataTable<AppUser>
          columns={userCols}
          rows={users.data ?? []}
          rowKey={(u) => String(u.id)}
          loading={users.isLoading}
        />
      )}

      {tab === "roles" && (
        <DataTable<Role>
          columns={roleCols}
          rows={roles.data ?? []}
          rowKey={(r) => String(r.id)}
          loading={roles.isLoading}
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create user"
        size="lg"
        footer={<>
          <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Create</button>
        </>}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="label">Username</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
          <div><label className="label">Full name</label>
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
          <div><label className="label">Email</label>
            <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Branch</label>
            <input className="input" value={form.branchCode} onChange={(e) => setForm({ ...form, branchCode: e.target.value })} /></div>
          <div><label className="label">Department</label>
            <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          <div><label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Roles</label>
            <select multiple className="input min-h-[6rem]"
              value={form.roles}
              onChange={(e) => setForm({ ...form, roles: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
              {(roles.data ?? []).map((r) => <option key={r.roleCode} value={r.roleCode}>{r.roleName}</option>)}
            </select></div>
        </div>
      </Modal>
    </>
  );
}
