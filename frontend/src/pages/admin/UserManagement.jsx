import { useEffect, useState } from "react";
import { Users, Plus, KeyRound, Power, X } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Notice from "../../components/ui/Notice";

const roleBadges = {
  admin: "bg-[#153a33] text-white border-transparent",
  registrar: "bg-purple-50 text-purple-700 border-purple-200",
  cashier: "bg-emerald-50 text-emerald-700 border-emerald-200",
  department: "bg-slate-100 text-slate-700 border-slate-200",
  student: "bg-amber-50 text-amber-800 border-amber-200",
};

const emptyForm = {
  name: "", username: "", role: "student", password: "",
  student_no: "", program_id: "", year_level: 1, department_id: "",
};

const inputCls =
  "h-10 w-full mt-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs sm:text-sm text-gray-900 outline-none transition focus:border-[#205247] focus:ring-2 focus:ring-[#205247]/15";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ roles: [], programs: [], departments: [] });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const [notice, setNotice] = useState({ type: "error", text: "" });
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    api.get("/admin/users").then(({ data }) => setUsers(data.data ?? data)).catch(() => {});
  }, [reload]);

  useEffect(() => {
    api.get("/admin/meta").then(({ data }) => setMeta(data)).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice({ type: "error", text: "" });
    const payload = { name: form.name, username: form.username, role: form.role, password: form.password };
    if (form.role === "student") {
      payload.student_no = form.student_no;
      payload.program_id = Number(form.program_id);
      payload.year_level = Number(form.year_level);
    }
    if (form.role === "department") payload.department_id = Number(form.department_id);

    try {
      await api.post("/admin/users", payload);
      setNotice({ type: "success", text: `Account "${form.username}" created successfully.` });
      setForm(emptyForm);
      setShowForm(false);
      setReload((n) => n + 1);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      await api.put(`/admin/users/${u.id}`, { is_active: !u.is_active });
      setNotice({ type: "success", text: `${u.username} has been ${u.is_active ? "deactivated" : "activated"}.` });
      setReload((n) => n + 1);
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  const resetPassword = async (u) => {
    const password = window.prompt(`New password for ${u.username} (min. 8 characters, letters and numbers):`);
    if (!password) return;
    try {
      await api.put(`/admin/users/${u.id}`, { password });
      setNotice({ type: "success", text: `Password reset successfully for ${u.username}.` });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Accounts</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            System identity administration, account provisioning, and access permissions.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 self-start sm:self-auto rounded-xl bg-[#153a33] px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#102d28]"
          >
            <Plus className="h-4 w-4" /> Add User Account
          </button>
        )}
      </div>

      <Notice type={notice.type}>{notice.text}</Notice>

      {showForm && (
        <Card className="border-[#205247]/30 ring-1 ring-[#205247]/20">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Create New Institutional Account</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Full Name</span>
                <input required value={form.name} onChange={set("name")} className={inputCls} placeholder="e.g. Maria Santos" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Username</span>
                <input required value={form.username} onChange={set("username")} className={inputCls} placeholder="e.g. msantos" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Account Role</span>
                <select value={form.role} onChange={set("role")} className={inputCls}>
                  {meta.roles.map((r) => (
                    <option key={r} value={r} className="capitalize">{r}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Temporary Password</span>
                <input required type="password" value={form.password} onChange={set("password")} className={inputCls} placeholder="Min. 8 characters" />
              </label>

              {form.role === "student" && (
                <>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Student ID Number</span>
                    <input required value={form.student_no} onChange={set("student_no")} className={inputCls} placeholder="2026-00126" />
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Academic Program</span>
                    <select required value={form.program_id} onChange={set("program_id")} className={inputCls}>
                      <option value="">Select program</option>
                      {meta.programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Year Level</span>
                    <select value={form.year_level} onChange={set("year_level")} className={inputCls}>
                      {[1, 2, 3, 4, 5, 6].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              {form.role === "department" && (
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Assigned Department</span>
                  <select required value={form.department_id} onChange={set("department_id")} className={inputCls}>
                    <option value="">Select department</option>
                    {meta.departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 rounded-xl border border-gray-200 px-4 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center justify-center rounded-xl bg-[#153a33] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[#102d28] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating…" : "Save Account"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Accounts Directory</h2>
            <p className="mt-0.5 text-xs text-gray-500">Configured institutional users</p>
          </div>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
            {users.length} registered
          </span>
        </div>

        <div className="portal-table-wrap">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-gray-300" />
                      <p className="text-xs font-semibold text-gray-700">No users found</p>
                      <p className="text-[11px] text-gray-400">Institutional accounts will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-gray-50/60 ${u.is_active ? "" : "opacity-60"}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#153a33] text-xs font-bold text-white">
                          {u.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          {(u.student_no || u.department) && (
                            <p className="font-mono text-[11px] text-gray-500 font-normal">
                              {u.student_no || u.department}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-600">
                      {u.username}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize ${
                          roleBadges[u.role] || "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          u.is_active ? "text-emerald-700" : "text-gray-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.is_active ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => resetPassword(u)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-800"
                          title="Reset password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            type="button"
                            onClick={() => toggleActive(u)}
                            className={`rounded-lg p-1.5 transition ${
                              u.is_active
                                ? "text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                                : "text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                            title={u.is_active ? "Deactivate account" : "Activate account"}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
