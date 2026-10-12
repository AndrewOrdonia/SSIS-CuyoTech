import { useEffect, useState } from "react";
import { Users, Plus, KeyRound, Power } from "lucide-react";
import api, { getErrorMessage } from "../../services/api";
import { Card } from "../../components/ui/Card";
import Notice from "../../components/ui/Notice";

const roleBadges = {
  admin: "bg-blue-900 text-white",
  registrar: "bg-purple-50 text-purple-700 border border-purple-200",
  cashier: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  department: "bg-slate-100 text-slate-700 border border-slate-200",
  student: "bg-amber-50 text-amber-700 border border-amber-200",
};

const emptyForm = {
  name: "", username: "", role: "student", password: "",
  student_no: "", program_id: "", year_level: 1, department_id: "",
};

const inputCls =
  "w-full mt-1.5 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

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
      setNotice({ type: "success", text: `Account "${form.username}" created.` });
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
      setNotice({ type: "success", text: `${u.username} ${u.is_active ? "deactivated" : "activated"}.` });
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
      setNotice({ type: "success", text: `Password reset for ${u.username}.` });
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Accounts</h1>

      <Notice type={notice.type}>{notice.text}</Notice>

      {showForm && (
        <Card className="mb-6 border border-gray-200/80">
          <h2 className="font-bold text-gray-800 text-base mb-4">Create New Account</h2>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Full Name</span>
                <input required value={form.name} onChange={set("name")} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Username</span>
                <input required value={form.username} onChange={set("username")} className={inputCls} placeholder="letters, numbers, . _ -" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Role</span>
                <select value={form.role} onChange={set("role")} className={inputCls}>
                  {meta.roles.map((r) => (
                    <option key={r} value={r} className="capitalize">{r}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">Temporary Password</span>
                <input required type="password" value={form.password} onChange={set("password")} className={inputCls} placeholder="min. 8 chars, letters + numbers" />
              </label>

              {form.role === "student" && (
                <>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Student Number</span>
                    <input required value={form.student_no} onChange={set("student_no")} className={inputCls} placeholder="2026-00126" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Program</span>
                    <select required value={form.program_id} onChange={set("program_id")} className={inputCls}>
                      <option value="">Select program</option>
                      {meta.programs.map((p) => (
                        <option key={p.id} value={p.id}>{p.code} &mdash; {p.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Year Level</span>
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
                  <span className="text-sm font-semibold text-gray-700">Department</span>
                  <select required value={form.department_id} onChange={set("department_id")} className={inputCls}>
                    <option value="">Select department</option>
                    {meta.departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0 border border-gray-200/80">
        <div className="p-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-base">System Accounts Directory</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
              {users.length} Total Users
            </span>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add User
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Username</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Role</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-600">No users found</p>
                      <p className="text-xs text-gray-400">System user records will be listed here.</p>
                    </div>
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className={`hover:bg-gray-50/60 transition-colors ${u.is_active ? "" : "opacity-60"}`}>
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                        {u.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <span>{u.name}</span>
                        {(u.student_no || u.department) && (
                          <p className="text-[11px] text-gray-400 font-normal">{u.student_no || u.department}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {u.username}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadges[u.role] || "bg-gray-100 text-gray-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.is_active ? "text-emerald-600" : "text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => resetPassword(u)}
                        className="text-blue-900 hover:text-blue-700 p-1.5 rounded cursor-pointer"
                        title="Reset password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => toggleActive(u)}
                          className={`p-1.5 rounded cursor-pointer ${u.is_active ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-800"}`}
                          title={u.is_active ? "Deactivate account" : "Activate account"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
