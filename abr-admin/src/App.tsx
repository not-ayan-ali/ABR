import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { BookOpen, LogOut, Library, Plus, Search, Trash2, Edit, X, ArrowLeft, AlignLeft, AlignCenter, AlignRight, LayoutDashboard } from 'lucide-react'
import DashboardPage from './pages/DashboardPage'

interface Novel {
  id: string
  title: string
  author: string
  synopsis: string
  cover_image_url: string
  category: string
  age_rating: string
  status: 'draft' | 'published'
  created_at: string
}

interface Episode {
  id: string
  novel_id: string
  title: string
  order: number
  body: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
}

export default function AdminApp() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Navigation state
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'novels' | 'episodes'>('dashboard')
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null)

  // Novels state
  const [novels, setNovels] = useState<Novel[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null)

  // Novel Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    synopsis: '',
    category: 'Romance',
    age_rating: '13+',
    status: 'draft' as 'draft' | 'published',
    cover_image_url: ''
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  // Episodes state
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)
  const [episodeForm, setEpisodeForm] = useState({
    title: '',
    body: '',
    status: 'draft' as 'draft' | 'published',
    alignment: 'right' as 'left' | 'center' | 'right'
  })

  // Check auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchNovels()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchNovels()
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (selectedNovel) {
      fetchEpisodes(selectedNovel.id)
    }
  }, [selectedNovel])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const fetchNovels = async () => {
    const { data } = await supabase
      .from('novels')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setNovels(data)
  }

  const fetchEpisodes = async (novelId: string) => {
    const { data } = await supabase
      .from('episodes')
      .select('*')
      .eq('novel_id', novelId)
      .order('order', { ascending: true })
    if (data) setEpisodes(data)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('novel-covers')
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg',
      })

    if (uploadError) {
      alert('Error uploading cover image: ' + uploadError.message)
      setUploadingImage(false)
      return
    }

    const { data } = supabase.storage.from('novel-covers').getPublicUrl(filePath)
    setFormData({ ...formData, cover_image_url: data.publicUrl })
    setUploadingImage(false)
  }

  const handleSaveNovel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.author) {
      alert('Title and Author are required.')
      return
    }

    if (editingNovel) {
      const { error } = await supabase
        .from('novels')
        .update({
          title: formData.title,
          author: formData.author,
          synopsis: formData.synopsis,
          category: formData.category,
          age_rating: formData.age_rating,
          status: formData.status,
          cover_image_url: formData.cover_image_url,
          updated_at: new Date()
        })
        .eq('id', editingNovel.id)

      if (error) alert('Error updating novel: ' + error.message)
      else {
        setIsModalOpen(false)
        setEditingNovel(null)
        fetchNovels()
      }
    } else {
      const { error } = await supabase.from('novels').insert([formData])
      if (error) alert('Error creating novel: ' + error.message)
      else {
        setIsModalOpen(false)
        fetchNovels()
      }
    }
  }

  const handleDeleteNovel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this novel? This will also delete all its episodes.')) return
    const { error } = await supabase.from('novels').delete().eq('id', id)
    if (error) alert('Error deleting novel: ' + error.message)
    else fetchNovels()
  }

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNovel) return
    if (!episodeForm.title || !episodeForm.body) {
      alert('Title and body content are required.')
      return
    }

    const now = new Date()
    const publishedAt = episodeForm.status === 'published' ? now.toISOString() : null

    if (editingEpisode) {
      const { error } = await supabase
        .from('episodes')
        .update({
          title: episodeForm.title,
          body: episodeForm.body,
          status: episodeForm.status,
          published_at: publishedAt,
          updated_at: now
        })
        .eq('id', editingEpisode.id)

      if (error) alert('Error updating episode: ' + error.message)
      else {
        setIsEpisodeModalOpen(false)
        setEditingEpisode(null)
        fetchEpisodes(selectedNovel.id)
      }
    } else {
      const nextOrder = episodes.length > 0 ? Math.max(...episodes.map(e => e.order)) + 1 : 1
      const { error } = await supabase.from('episodes').insert([{
        novel_id: selectedNovel.id,
        title: episodeForm.title,
        order: nextOrder,
        body: episodeForm.body,
        status: episodeForm.status,
        published_at: publishedAt
      }])

      if (error) alert('Error creating episode: ' + error.message)
      else {
        setIsEpisodeModalOpen(false)
        fetchEpisodes(selectedNovel.id)
      }
    }
  }

  const handleDeleteEpisode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) return
    const { error } = await supabase.from('episodes').delete().eq('id', id)
    if (error) alert('Error deleting episode: ' + error.message)
    else if (selectedNovel) fetchEpisodes(selectedNovel.id)
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <form onSubmit={handleLogin} className="p-8 border border-outline-variant rounded-lg w-full max-w-md bg-surface-container-low">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-8 h-8 text-secondary" />
            <h1 className="text-2xl font-bold text-on-surface">ABR Admin Login</h1>
          </div>
          {error && <div className="mb-4 p-3 bg-error/20 text-error rounded text-sm">{error}</div>}
          <div className="mb-4">
            <label className="block text-sm text-on-surface-variant mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-on-surface-variant mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-on-secondary py-2.5 rounded font-medium hover:opacity-90 transition-opacity"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-surface-lowest">
      {/* Sidebar */}
      <aside className="w-64 border-r border-outline-variant bg-surface flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-outline-variant">
            <BookOpen className="w-6 h-6 text-secondary" />
            <span className="font-bold text-lg text-on-surface">ABR Writer</span>
          </div>
          <ul className="p-4 space-y-2">
            <li>
              <button
                onClick={() => { setCurrentTab('dashboard'); setSelectedNovel(null); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded w-full text-left font-medium transition-colors ${
                  currentTab === 'dashboard'
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentTab('novels'); setSelectedNovel(null); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded w-full text-left font-medium transition-colors ${
                  currentTab === 'novels' && !selectedNovel
                    ? 'bg-secondary/20 text-secondary border border-secondary/30'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Library className="w-5 h-5" />
                Novels
              </button>
            </li>
          </ul>
        </div>
        <div className="p-4 border-t border-outline-variant">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-error w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-outline-variant px-8 flex items-center justify-between bg-surface">
          <div className="flex items-center gap-4">
            {selectedNovel && (
              <button
                onClick={() => setSelectedNovel(null)}
                className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-on-surface">
              {currentTab === 'dashboard' ? 'Overview' : selectedNovel ? `Episodes — ${selectedNovel.title}` : 'Novel Management'}
            </h2>
          </div>
          <span className="text-sm text-on-surface-variant">{session.user.email}</span>
        </header>

        <div className="p-8">
          {currentTab === 'dashboard' ? (
            <DashboardPage />
          ) : !selectedNovel ? (
            /* Novels View */
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-72">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-outline" />
                  <input
                    type="text"
                    placeholder="Search novels..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-container border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingNovel(null)
                    setFormData({
                      title: '',
                      author: '',
                      synopsis: '',
                      category: 'Romance',
                      age_rating: '13+',
                      status: 'draft',
                      cover_image_url: ''
                    })
                    setIsModalOpen(true)
                  }}
                  className="flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  New Novel
                </button>
              </div>

              <div className="border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-xs text-on-surface-variant uppercase tracking-wider bg-surface-container">
                      <th className="p-4">Cover</th>
                      <th className="p-4">Title & Author</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Age Rating</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-sm">
                    {novels
                      .filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.author.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((novel) => (
                        <tr key={novel.id} className="hover:bg-surface-container/50 transition-colors">
                          <td className="p-4">
                            {novel.cover_image_url ? (
                              <img src={novel.cover_image_url} alt={novel.title} className="w-12 h-16 object-cover rounded border border-outline-variant" />
                            ) : (
                              <div className="w-12 h-16 bg-surface-container-high rounded border border-outline-variant flex items-center justify-center text-xs text-outline">
                                No Cover
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-on-surface">{novel.title}</div>
                            <div className="text-xs text-on-surface-variant">by {novel.author}</div>
                          </td>
                          <td className="p-4 text-on-surface-variant">{novel.category}</td>
                          <td className="p-4 text-on-surface-variant">{novel.age_rating}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                              novel.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {novel.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedNovel(novel)}
                              className="px-3 py-1.5 bg-surface-container-high text-on-surface hover:text-secondary rounded text-xs border border-outline-variant font-medium transition-colors"
                            >
                              Episodes
                            </button>
                            <button
                              onClick={() => {
                                setEditingNovel(novel)
                                setFormData({
                                  title: novel.title,
                                  author: novel.author,
                                  synopsis: novel.synopsis || '',
                                  category: novel.category || 'Romance',
                                  age_rating: novel.age_rating || '13+',
                                  status: novel.status || 'draft',
                                  cover_image_url: novel.cover_image_url || ''
                                })
                                setIsModalOpen(true)
                              }}
                              className="p-1.5 text-on-surface-variant hover:text-secondary inline-block transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNovel(novel.id)}
                              className="p-1.5 text-on-surface-variant hover:text-error inline-block transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {novels.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                          No novels found. Click "New Novel" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Episodes View */
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-sm text-on-surface-variant">Managing episodes for </span>
                  <span className="font-semibold text-on-surface">{selectedNovel.title}</span>
                </div>
                <button
                  onClick={() => {
                    setEditingEpisode(null)
                    setEpisodeForm({
                      title: '',
                      body: '',
                      status: 'draft',
                      alignment: 'right'
                    })
                    setIsEpisodeModalOpen(true)
                  }}
                  className="flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  New Episode
                </button>
              </div>

              <div className="border border-outline-variant rounded bg-surface-container-low overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-xs text-on-surface-variant uppercase tracking-wider bg-surface-container">
                      <th className="p-4 w-16">Order</th>
                      <th className="p-4">Episode Title</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Published At</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-sm">
                    {episodes.map((episode) => (
                      <tr key={episode.id} className="hover:bg-surface-container/50 transition-colors">
                        <td className="p-4 font-bold text-secondary">#{episode.order}</td>
                        <td className="p-4 font-semibold text-on-surface">{episode.title}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                            episode.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {episode.status}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant text-xs">
                          {episode.published_at ? new Date(episode.published_at).toLocaleString() : '—'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingEpisode(episode)
                              setEpisodeForm({
                                title: episode.title,
                                body: episode.body,
                                status: episode.status,
                                alignment: 'right'
                              })
                              setIsEpisodeModalOpen(true)
                            }}
                            className="p-1.5 text-on-surface-variant hover:text-secondary inline-block transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEpisode(episode.id)}
                            className="p-1.5 text-on-surface-variant hover:text-error inline-block transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {episodes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                          No episodes yet for this novel. Click "New Episode" to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Novel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-low border border-outline-variant rounded-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-on-surface mb-6">
              {editingNovel ? 'Edit Novel' : 'Create New Novel'}
            </h3>

            <form onSubmit={handleSaveNovel} className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Author *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Synopsis</label>
                <textarea
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary"
                  >
                    <option value="Romance">Romance</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Drama">Drama</option>
                    <option value="Historical">Historical</option>
                    <option value="Fantasy">Fantasy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Age Rating</label>
                  <select
                    value={formData.age_rating}
                    onChange={(e) => setFormData({ ...formData, age_rating: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary"
                  >
                    <option value="All Ages">All Ages</option>
                    <option value="13+">13+</option>
                    <option value="16+">16+</option>
                    <option value="18+">18+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Cover Image</label>
                <div className="flex items-center gap-4">
                  {formData.cover_image_url && (
                    <img src={formData.cover_image_url} alt="Cover preview" className="w-12 h-16 object-cover rounded border border-outline-variant" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-medium file:bg-surface-container-high file:text-on-surface hover:file:bg-surface-bright"
                  />
                </div>
                {uploadingImage && <div className="text-xs text-secondary mt-1">Uploading image...</div>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface-container-high text-on-surface rounded text-sm hover:bg-surface-bright transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-on-secondary rounded text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Save Novel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episode Modal */}
      {isEpisodeModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-low border border-outline-variant rounded-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEpisodeModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-on-surface mb-6">
              {editingEpisode ? `Edit Episode #${editingEpisode.order}` : `New Episode (Order #${episodes.length + 1})`}
            </h3>

            <form onSubmit={handleSaveEpisode} className="space-y-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Episode Title *</label>
                <input
                  type="text"
                  value={episodeForm.title}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                  required
                  placeholder="e.g. قسط 1"
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs text-on-surface-variant uppercase font-medium">Episode Body Content (Urdu) *</label>
                  <div className="flex items-center gap-1 bg-surface border border-outline-variant rounded p-1">
                    <button
                      type="button"
                      onClick={() => setEpisodeForm({ ...episodeForm, alignment: 'left' })}
                      className={`p-1 rounded ${episodeForm.alignment === 'left' ? 'bg-secondary/20 text-secondary' : 'text-on-surface-variant'}`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEpisodeForm({ ...episodeForm, alignment: 'center' })}
                      className={`p-1 rounded ${episodeForm.alignment === 'center' ? 'bg-secondary/20 text-secondary' : 'text-on-surface-variant'}`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEpisodeForm({ ...episodeForm, alignment: 'right' })}
                      className={`p-1 rounded ${episodeForm.alignment === 'right' ? 'bg-secondary/20 text-secondary' : 'text-on-surface-variant'}`}
                      title="Align Right (Urdu)"
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={episodeForm.body}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, body: e.target.value })}
                  required
                  rows={10}
                  placeholder="اردو متن یہاں درج کریں..."
                  style={{
                    direction: 'rtl',
                    textAlign: episodeForm.alignment,
                    fontFamily: '"Noto Nastaliq Urdu", serif',
                    lineHeight: '2.0'
                  }}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant rounded text-on-surface text-lg focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-xs text-on-surface-variant mb-1 uppercase font-medium">Status</label>
                <select
                  value={episodeForm.status}
                  onChange={(e) => setEpisodeForm({ ...episodeForm, status: e.target.value as 'draft' | 'published' })}
                  className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-on-surface text-sm focus:outline-none focus:border-secondary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  className="px-4 py-2 bg-surface-container-high text-on-surface rounded text-sm hover:bg-surface-bright transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-on-secondary rounded text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Save Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
