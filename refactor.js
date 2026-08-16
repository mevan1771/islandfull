const fs = require('fs');
const path = './app/admin/hosts/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove imports
content = content.replace(/import \{ createAvatar \} from '@dicebear\/core'\r?\nimport \{ avataaars \} from '@dicebear\/collection'\r?\n/, "");

// 2. Remove state and functions
const stateRegex = /  \/\/ Avatar Designer State[\s\S]*?  useEffect\(\(\) => \{\r?\n    loadHosts\(\)/;
content = content.replace(stateRegex, "  useEffect(() => {\n    loadHosts()");

// 3. Remove setIsRefiningAvatar(false)
content = content.replace(/    setResetPassword\(""\)\r?\n    setIsRefiningAvatar\(false\)\r?\n  \}/, "    setResetPassword(\"\")\n  }");

// 4. Replace UI
const uiRegex = /              <div className="space-y-2">\r?\n                <label className="text-sm font-bold text-zinc-800">Host Avatar \(Chat Avatar\)<\/label>[\s\S]*?                <div className="relative group cursor-pointer">\r?\n                  <input\r?\n                    type="file"\r?\n                    accept="image\/\*"/;

const newUi = `              <div className="space-y-2">
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
                      const newUrl = \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${encodeURIComponent(seed)}\`;
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
                    accept="image/*"`;

content = content.replace(uiRegex, newUi);

fs.writeFileSync(path, content);
console.log("Done");
