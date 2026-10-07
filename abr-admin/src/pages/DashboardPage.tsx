import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BookOpen, FileText, Eye, Star } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  totalNovels: number
  totalEpisodes: number
  totalReads: number
  avgRating: number
  ratingCount: number
  novelsSubtext: string
  episodesSubtext: string
  readsSubtext: string
}

interface CategoryData {
  name: string
  value: number
  percentage: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalNovels: 0,
    totalEpisodes: 0,
    totalReads: 0,
    avgRating: 0,
    ratingCount: 0,
    novelsSubtext: '—',
    episodesSubtext: '—',
    readsSubtext: '—',
  })
  const [readsOverTime, setReadsOverTime] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const now = new Date()
    const daysAgo = (n: number) => {
      const d = new Date(now)
      d.setDate(d.getDate() - n)
      return d
    }

    // Fetch novels (count + created_at for the "recent" subtext)
    const { data: novelsData } = await supabase
      .from('novels')
      .select('created_at, category')

    const novels = novelsData || []
    const novelsThisMonth = novels.filter(
      (n: any) => new Date(n.created_at) >= daysAgo(30)
    ).length

    // Fetch episodes (count + created_at for the "recent" subtext)
    const { data: episodesData } = await supabase
      .from('episodes')
      .select('created_at')

    const episodes = episodesData || []
    const episodesThisWeek = episodes.filter(
      (e: any) => new Date(e.created_at) >= daysAgo(7)
    ).length

    // Fetch reading activity (reads with progress, used for totals,
    // week-over-week delta, and the time-series chart)
    const { data: progressData } = await supabase
      .from('reading_progress')
      .select('last_read_at')
      .gt('progress_percent', 0)

    const readTimes = (progressData || []).map(
      (r: any) => new Date(r.last_read_at).getTime()
    )
    const weekAgo = daysAgo(7).getTime()
    const twoWeeksAgo = daysAgo(14).getTime()
    const totalReads = readTimes.length
    const readsThisWeek = readTimes.filter((t) => t >= weekAgo).length
    const readsPriorWeek = readTimes.filter(
      (t) => t < weekAgo && t >= twoWeeksAgo
    ).length
    const readsDelta =
      readsPriorWeek > 0
        ? Math.round(((readsThisWeek - readsPriorWeek) / readsPriorWeek) * 100)
        : readsThisWeek > 0
          ? 100
          : 0

    // Fetch ratings
    const { data: ratingsData } = await supabase
      .from('ratings')
      .select('rating')

    const avgRating = ratingsData && ratingsData.length > 0
      ? Math.round((ratingsData.reduce((sum: number, r: any) => sum + r.rating, 0) / ratingsData.length) * 10) / 10
      : 0

    setStats({
      totalNovels: novels.length,
      totalEpisodes: episodes.length,
      totalReads,
      avgRating,
      ratingCount: ratingsData?.length || 0,
      novelsSubtext:
        novelsThisMonth > 0 ? `+${novelsThisMonth} this month` : 'None this month',
      episodesSubtext:
        episodesThisWeek > 0 ? `+${episodesThisWeek} this week` : 'None this week',
      readsSubtext:
        readsPriorWeek > 0
          ? `${readsDelta >= 0 ? '+' : ''}${readsDelta}% vs last week`
          : readsThisWeek > 0
            ? `${readsThisWeek} this week`
            : 'No reads yet',
    })

    // Reads over time (last 7 days)
    if (progressData) {
      const last7Days: { [key: string]: number } = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const key = d.toLocaleDateString('en-US', { weekday: 'short' })
        last7Days[key] = 0
      }

      progressData.forEach((row: any) => {
        const date = new Date(row.last_read_at)
        const key = date.toLocaleDateString('en-US', { weekday: 'short' })
        if (key in last7Days) {
          last7Days[key]++
        }
      })

      setReadsOverTime(
        Object.entries(last7Days).map(([day, count]) => ({ day, reads: count }))
      )
    }

    // Fetch category breakdown
    if (novels.length > 0) {
      const catCounts: { [key: string]: number } = {}
      novels.forEach((n: any) => {
        const cat = n.category || 'Uncategorized'
        catCounts[cat] = (catCounts[cat] || 0) + 1
      })
      const total = novels.length
      setCategoryData(
        Object.entries(catCounts).map(([name, value]) => ({
          name,
          value,
          percentage: Math.round((value / total) * 100),
        }))
      )
    } else {
      setCategoryData([])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Total Novels"
          value={stats.totalNovels.toString()}
          subtext={stats.novelsSubtext}
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total Episodes"
          value={stats.totalEpisodes.toString()}
          subtext={stats.episodesSubtext}
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Total Reads"
          value={stats.totalReads >= 1000 ? `${(stats.totalReads / 1000).toFixed(1)}k` : stats.totalReads.toString()}
          subtext={stats.readsSubtext}
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Avg Rating"
          value={stats.avgRating.toString()}
          subtext={`Across ${stats.ratingCount} reviews`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reads over Time */}
        <div className="lg:col-span-2 border border-outline-variant rounded-lg p-6 bg-surface-container-low">
          <h3 className="text-sm font-semibold text-on-surface mb-4">Reads over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={readsOverTime}>
              <defs>
                <linearGradient id="colorReads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e9c176" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e9c176" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#46464d" />
              <XAxis dataKey="day" stroke="#909098" fontSize={12} />
              <YAxis stroke="#909098" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#151e3a',
                  border: '1px solid #46464d',
                  borderRadius: '4px',
                  color: '#dce1ff',
                }}
              />
              <Area
                type="monotone"
                dataKey="reads"
                stroke="#e9c176"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="border border-outline-variant rounded-lg p-6 bg-surface-container-low">
          <h3 className="text-sm font-semibold text-on-surface mb-4">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryData.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <span className="text-sm text-on-surface">{cat.name}</span>
                  </div>
                  <span className="text-sm text-on-surface-variant">{cat.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {categoryData.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode; label: string; value: string; subtext: string }) {
  return (
    <div className="border border-outline-variant rounded-lg p-5 bg-surface-container-low">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm text-on-surface-variant">{label}</span>
        <span className="text-on-surface-variant">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-secondary mb-1">{value}</div>
      <div className="text-xs text-on-surface-variant">{subtext}</div>
    </div>
  )
}
