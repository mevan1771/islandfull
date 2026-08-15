"use client"

import { useState, useEffect } from "react"
import { getHosts, createHost, updateHost, deleteHost } from "@/app/actions/hosts"
import { adminCreateHostAccount, adminProvisionLegacyHost, adminResetHostPassword } from "@/app/actions/admin-auth"
import { Loader2, Plus, Edit2, Trash2, UserCircle, Upload } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"
import Image from "next/image"

export default function HostsPage() {
  const [hosts, setHosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetPassword, setResetPassword] = useState("")

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHost, setEditingHost] = useState<any>(null)
  const [formData, setFormData] = useState({ name: "", image_url: "", avatar_url: "", contact_name: "", email: "", phone: "", address: "", payout_notes: "", login_email: "", login_password: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    loadHosts()
  }, [])

  const loadHosts = async () => {
    setIsLoading(true)
    const data = await getHosts()
    setHosts(data)
    setIsLoading(false)
  }

  const openModal = (host?: any) => {
    if (host) {
      setEditingHost(host)
      setFormData({
        name: host.name,
        image_url: host.image_url || "",
        avatar_url: host.avatar_url || "",
        contact_name: host.contact_name || "",
        email: host.email || "",
        phone: host.phone || "",
        address: host.address || "",
        payout_notes: host.payout_notes || "",
        login_email: "",
        login_password: ""
      })
    } else {
      setEditingHost(null)
      setFormData({ name: "", image_url: "", avatar_url: "", contact_name: "", email: "", phone: "", address: "", payout_notes: "", login_email: "", login_password: "" })
    }
    setImageFile(null)
    setAvatarFile(null)
    setResetPassword("")
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingHost(null)
    setImageFile(null)
    setAvatarFile(null)
    setResetPassword("")
  }

  const handleResetPassword = async () => {
    if (!editingHost || !editingHost.user_id) return
    setIsResetting(true)
    const res = await adminResetHostPassword(editingHost.user_id, resetPassword)
    if (res.success) {
      toast.success("Password reset successfully!")
      setResetPassword("")
    } else {
      toast.error("Error resetting password: " + res.error)
    }
    setIsResetting(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const data = new FormData()
    data.append("name", formData.name)
    if (formData.contact_name) data.append("contact_name", formData.contact_name)
    if (formData.email) data.append("email", formData.email)
    if (formData.phone) data.append("phone", formData.phone)
    if (formData.address) data.append("address", formData.address)
    if (formData.payout_notes) data.append("payout_notes", formData.payout_notes)
    if (formData.image_url) data.append("image_url", formData.image_url)
    if (imageFile) data.append("image_file", imageFile)
    if (formData.avatar_url) data.append("avatar_url", formData.avatar_url)
    if (avatarFile) data.append("avatar_file", avatarFile)

    let res;
    if (editingHost) {
      if (!editingHost.user_id && formData.login_email && formData.login_password) {
        data.append("login_email", formData.login_email)
        data.append("login_password", formData.login_password)
        res = await adminProvisionLegacyHost(editingHost.id, data)
      } else {
        res = await updateHost(editingHost.id, data)
      }
    } else {
      // It's a new host, append the login details for provisioning
      data.append("login_email", formData.login_email)
      data.append("login_password", formData.login_password)
      res = await adminCreateHostAccount(data)
    }

    if (res.success) {
      toast.success(editingHost ? "Host updated successfully!" : "Host account created successfully!")
      closeModal()
      await loadHosts()
    } else {
      toast.error("Error saving host: " + res.error)
    }
    setIsSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this host? All associated activities will need to be reassigned.")) {
      setIsLoading(true)
      const res = await deleteHost(id)
      if (res.success) {
        await loadHosts()
        toast.success("Host deleted successfully")
      } else {
        alert(res.error)
        setIsLoading(false)
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  if (isLoading && hosts.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-24 pb-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Manage tour operators and their profile information.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Host
          </button>
        </div>



        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="p-4 pl-6 text-xs font-bold text-zinc-400 uppercase tracking-wider">Host Profile</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">ID</th>
                <th className="p-4 pr-6 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {hosts.map((host) => (
                <tr key={host.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-4">
                    {host.image_url ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200">
                        <Image src={host.image_url} alt={host.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-zinc-900">{host.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Joined {new Date(host.created_at).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-zinc-500 font-mono bg-zinc-100 px-2 py-1 rounded-md">
                      {host.id.split('-')[0]}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openModal(host)}
                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit Host"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(host.id)}
                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Host"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {hosts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-zinc-500">
                    No hosts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Host Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-100 shrink-0">
              <h2 className="text-xl font-bold text-zinc-900">
                {editingHost ? "Edit Host Profile" : "Add New Host"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              {(!editingHost || (editingHost && !editingHost.user_id)) && (
                <div className="space-y-4 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl mb-6">
                  <h3 className="text-lg font-bold text-zinc-900">Provision Login Account</h3>
                  <p className="text-sm text-zinc-500 mb-4">Set up a secure login account for the tour operator to access the portal.</p>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Login Email or Phone Number</label>
                    <input
                      type="text"
                      required={!editingHost}
                      value={formData.login_email}
                      onChange={(e) => setFormData({ ...formData, login_email: e.target.value })}
                      placeholder="operator@company.com or 0771234567"
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Temporary Password</label>
                    <input
                      type="text"
                      required={!editingHost}
                      value={formData.login_password}
                      onChange={(e) => setFormData({ ...formData, login_password: e.target.value })}
                      placeholder="Secure temporary password"
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900 bg-white"
                    />
                    <p className="text-xs text-zinc-500 mt-1">They will be able to change this later.</p>
                  </div>
                </div>
              )}

              {editingHost && editingHost.user_id && (
                <div className="space-y-4 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">Reset Operator Password</h3>
                  <p className="text-sm text-zinc-500 mb-4">Forcefully update the password for this operator's login account.</p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                      className="flex-1 h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isResetting || resetPassword.length < 6}
                      className="h-12 px-6 font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800">Business / Host Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hiriketiya Surf School"
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800">Profile Image (URL or Upload)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900 mb-2"
                />

                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center gap-2 group-hover:border-zinc-300 transition-colors">
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-600 truncate">
                      {imageFile ? imageFile.name : "Or upload an image file..."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-800">Host Avatar (Chat Avatar)</label>
                <div className="flex items-center gap-3 mb-2">
                  {formData.avatar_url && (
                    <img
                      src={formData.avatar_url}
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-full border border-zinc-200 bg-zinc-50 object-cover shrink-0"
                    />
                  )}
                  <input
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.png"
                    className="flex-1 h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900"
                  />
                </div>

                <div className="flex flex-row items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const seed = (formData.contact_name || formData.name || 'host') + '-' + Math.random().toString(36).substring(7);
                      const newUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
                      setFormData(prev => ({ ...prev, avatar_url: newUrl }));
                    }}
                    className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-bold text-zinc-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    🎲 Auto-Generate
                  </button>
                  <a
                    href="https://getavataaars.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-bold text-zinc-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    🎨 Create Custom
                  </a>
                </div>

                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center gap-2 group-hover:border-zinc-300 transition-colors">
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-600 truncate">
                      {avatarFile ? avatarFile.name : "Or upload an avatar file..."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Internal Private Details</h3>
                <p className="text-sm text-zinc-500 mb-4">These details are not shown to customers. Used for payouts and internal communications.</p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Contact Name</label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-800">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@host.com"
                        className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-800">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+94 77 123 4567"
                        className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Physical address or operating location"
                      className="w-full p-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900 min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-800">Payout / Bank Details</label>
                    <textarea
                      value={formData.payout_notes}
                      onChange={(e) => setFormData({ ...formData, payout_notes: e.target.value })}
                      placeholder="Bank Name, Account Name, Account Number, Routing/Swift code..."
                      className="w-full p-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium text-zinc-900 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-12 font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 h-12 font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Host"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

