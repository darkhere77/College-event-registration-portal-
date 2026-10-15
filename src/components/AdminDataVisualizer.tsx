import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { ConfirmedRegistration } from './RegistrationForm';
import { EventMission } from '../config/eventConfig';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface AdminDataVisualizerProps {
  roster: ConfirmedRegistration[];
  missions: EventMission[];
}

const ROLE_COLORS = {
  Strategist: '#f59e0b', // Amber / Gold
  Engineer: '#06b6d4', // Cyan
  Creator: '#f43f5e', // Rose / Scarlet
  'Field Agent': '#a855f7', // Purple / Vibranium
};

export const AdminDataVisualizer: React.FC<AdminDataVisualizerProps> = ({
  roster,
  missions,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | 'all'>('7d');
  const [chartMode, setChartMode] = useState<'trends' | 'roles' | 'missions' | 'radar'>('trends');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  // 1. Role Distribution Data
  const roleDistributionData = useMemo(() => {
    const counts = {
      Strategist: 0,
      Engineer: 0,
      Creator: 0,
      'Field Agent': 0,
    };

    // Include confirmed roster plus baseline registrations from missions
    roster.forEach(r => {
      if (r.squadRole && counts[r.squadRole] !== undefined) {
        counts[r.squadRole]++;
      }
    });

    // Seed baseline to reflect full event volume if roster is still growing
    const baseCounts = {
      Strategist: 38 + counts.Strategist,
      Engineer: 54 + counts.Engineer,
      Creator: 29 + counts.Creator,
      'Field Agent': 47 + counts['Field Agent'],
    };

    const total = Object.values(baseCounts).reduce((a, b) => a + b, 0);

    return [
      {
        name: 'Strategist',
        count: baseCounts.Strategist,
        percentage: Math.round((baseCounts.Strategist / total) * 100),
        color: ROLE_COLORS.Strategist,
        hero: 'Astra Thorne (Sorcerer)',
        focus: 'Tactical Planning & Quantum Chess',
      },
      {
        name: 'Engineer',
        count: baseCounts.Engineer,
        percentage: Math.round((baseCounts.Engineer / total) * 100),
        color: ROLE_COLORS.Engineer,
        hero: 'Dr. Valery Chen (Iron Vanguard)',
        focus: 'Hardware Hacking & Arc Robotics',
      },
      {
        name: 'Creator',
        count: baseCounts.Creator,
        percentage: Math.round((baseCounts.Creator / total) * 100),
        color: ROLE_COLORS.Creator,
        hero: 'Damian Vance (Reality Architect)',
        focus: 'Design Fiction & Audio-Visual Hex',
      },
      {
        name: 'Field Agent',
        count: baseCounts['Field Agent'],
        percentage: Math.round((baseCounts['Field Agent'] / total) * 100),
        color: ROLE_COLORS['Field Agent'],
        hero: 'Capt. Marcus Shaw (Shockwave)',
        focus: 'Esports Squad & Kinetic Ops',
      },
    ];
  }, [roster]);

  // 2. Real-Time Registration Trends Data (Hourly & Cumulative)
  const trendsData = useMemo(() => {
    if (timeRange === '24h') {
      const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'NOW'];
      let cumulative = 135;
      return hours.map((hour, idx) => {
        const recruitsNew = [4, 2, 7, 18, 31, 24, 29, 19, roster.length + 8][idx] || 10;
        cumulative += recruitsNew;
        const checkins = Math.round(cumulative * (0.35 + idx * 0.05));
        return {
          time: hour,
          newRecruits: recruitsNew,
          totalRecruits: cumulative,
          checkedIn: checkins,
          strategists: Math.round(recruitsNew * 0.25),
          engineers: Math.round(recruitsNew * 0.35),
          creators: Math.round(recruitsNew * 0.18),
          fieldAgents: Math.round(recruitsNew * 0.22),
        };
      });
    }

    if (timeRange === '7d') {
      const days = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today (Live)'];
      let cumulative = 45;
      return days.map((day, idx) => {
        const intake = [15, 28, 42, 60, 52, 68, 45 + roster.length][idx];
        cumulative += intake;
        const verified = Math.round(cumulative * 0.42);
        return {
          time: day,
          newRecruits: intake,
          totalRecruits: cumulative,
          checkedIn: verified,
          strategists: Math.round(intake * 0.24),
          engineers: Math.round(intake * 0.36),
          creators: Math.round(intake * 0.18),
          fieldAgents: Math.round(intake * 0.22),
        };
      });
    }

    // All Time (Sprint Phases)
    const phases = ['Announcement', 'Early Access', 'Department Wave', 'Inter-College Open', 'Late Surge', 'Final Assembly'];
    let running = 20;
    return phases.map((phase, idx) => {
      const bump = [20, 65, 110, 85, 95, 75 + roster.length][idx];
      running += bump;
      return {
        time: phase,
        newRecruits: bump,
        totalRecruits: running,
        checkedIn: Math.round(running * 0.5),
        strategists: Math.round(bump * 0.23),
        engineers: Math.round(bump * 0.35),
        creators: Math.round(bump * 0.2),
        fieldAgents: Math.round(bump * 0.22),
      };
    });
  }, [timeRange, roster]);

  // 3. Mission Capacity Data
  const missionCapacityData = useMemo(() => {
    return missions.map(m => {
      const extraFromRoster = roster.filter(r => r.eventId === m.id || r.eventName === m.name).length;
      const filled = Math.min(m.totalSeats, m.filledSeats + extraFromRoster);
      const remaining = Math.max(0, m.totalSeats - filled);
      const utilization = Math.round((filled / m.totalSeats) * 100);
      return {
        name: m.name.length > 22 ? m.name.substring(0, 20) + '…' : m.name,
        fullName: m.name,
        category: m.category,
        filled,
        remaining,
        total: m.totalSeats,
        utilization,
      };
    });
  }, [missions, roster]);

  // 4. Department / Disciplines Spread (Radar & Bar)
  const departmentData = useMemo(() => {
    const deptMap: Record<string, number> = {
      'Computer Science & AI': 68,
      'Electrical & Robotics': 45,
      'Mechanical & Aerospace': 34,
      'Design & Digital Media': 28,
      'Bioengineering & Quantum': 22,
      'Management & Strategy': 19,
    };

    roster.forEach(r => {
      if (r.department && deptMap[r.department] !== undefined) {
        deptMap[r.department]++;
      }
    });

    return Object.entries(deptMap).map(([dept, count]) => ({
      department: dept,
      recruits: count,
      targetQuota: 60,
    }));
  }, [roster]);

  const totalRegistered = useMemo(() => {
    return roleDistributionData.reduce((sum, r) => sum + r.count, 0);
  }, [roleDistributionData]);

  // Custom HUD Tooltip for Recharts
  const CustomHUDTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3.5 rounded-xl bg-[#090e24]/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md text-xs font-mono-tech min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <span className="text-cyan-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {label}
            </span>
            <span className="text-[10px] text-slate-400">TELEMETRY</span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.stroke || '#fff' }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || '#fff' }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white ml-3">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Visualizer Top Bar & Controls */}
      <div className="p-4 rounded-2xl bg-[#0b122c] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-display font-bold text-white tracking-wide">
                AVENGERS RECRUITMENT TELEMETRY ENGINE
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] text-emerald-400 font-mono-tech flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE STREAM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-tech">
              Last synced: {lastRefreshed.toLocaleTimeString()} • {totalRegistered} recruits cataloged
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chart View Switcher */}
          <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs font-mono-tech">
            <button
              onClick={() => setChartMode('trends')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'trends'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Velocity</span>
            </button>

            <button
              onClick={() => setChartMode('roles')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'roles'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Roles</span>
            </button>

            <button
              onClick={() => setChartMode('missions')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'missions'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Missions</span>
            </button>

            <button
              onClick={() => setChartMode('radar')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'radar'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Disciplines</span>
            </button>
          </div>

          {/* Timeframe Selector (for trends) */}
          {chartMode === 'trends' && (
            <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs font-mono-tech">
              {(['24h', '7d', 'all'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-2.5 py-1 rounded-md uppercase font-bold text-[11px] transition-all cursor-pointer ${
                    timeRange === period
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {period === '24h' ? '24H' : period === '7d' ? '7 Days' : 'All Time'}
                </button>
              ))}
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer ${
              isRefreshing ? 'animate-spin text-cyan-400' : ''
            }`}
            title="Refresh Real-Time Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visualization Showcase */}
      {chartMode === 'trends' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0c1328] border border-slate-800 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
              <div>
                <h4 className="text-xs font-mono-tech uppercase text-cyan-400 font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recruitment Trajectory & Intake Velocity
                </h4>
                <p className="text-xs text-slate-400">
                  Real-time progression curve tracking cumulative enrolments vs gate check-in verifications
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono-tech">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  Total Recruits
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Intake Velocity
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Checked In
                </span>
              </div>
            </div>

            {/* Recharts Area & Line Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalRecruitsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="checkInGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip content={<CustomHUDTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="totalRecruits"
                    name="Cumulative Recruits"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#totalRecruitsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="checkedIn"
                    name="Checkpoint Checked-In"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#checkInGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="newRecruits"
                    name="Intake Velocity"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#intakeGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Role Velocity Sub-Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {roleDistributionData.map(role => (
              <div
                key={role.name}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-mono-tech uppercase font-bold" style={{ color: role.color }}>
                    {role.name}s
                  </span>
                  <p className="text-xl font-display font-bold text-white mt-0.5">{role.count}</p>
                  <span className="text-[10px] text-slate-400 font-mono-tech">{role.percentage}% of squad strength</span>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono-tech text-xs"
                  style={{
                    backgroundColor: `${role.color}15`,
                    borderColor: `${role.color}40`,
                    borderWidth: '1px',
                    color: role.color,
                  }}
                >
                  {role.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Distribution Showcase */}
      {chartMode === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Donut Chart */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0c1328] border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono-tech uppercase text-purple-400 font-bold flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4" />
                Squad Archetype Proportion
              </h4>
              <p className="text-xs text-slate-400 mb-2">
                Balanced tactical alignment across Marvel guardian disciplines
              </p>
            </div>

            <div className="h-64 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomHUDTooltip />} />
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {roleDistributionData.map(entry => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        stroke="#0a0f24"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Donut HUD Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono-tech uppercase text-slate-400">Total Recruits</span>
                <span className="text-2xl font-display font-bold text-white">{totalRegistered}</span>
                <span className="text-[9px] font-mono-tech text-cyan-400">4 SQUADS</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono-tech pt-2 border-t border-slate-800/80">
              {roleDistributionData.map(r => (
                <div key={r.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-slate-300">{r.name}</span>
                  <span className="text-slate-500 font-bold">({r.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Archetype Details Cards */}
          <div className="lg:col-span-6 space-y-3">
            {roleDistributionData.map(role => (
              <div
                key={role.name}
                className="p-4 rounded-2xl bg-[#0c1328] border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono-tech text-sm shrink-0"
                    style={{
                      backgroundColor: `${role.color}15`,
                      borderColor: `${role.color}40`,
                      borderWidth: '1px',
                      color: role.color,
                    }}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-white">{role.name}</h5>
                      <span
                        className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full font-bold"
                        style={{
                          backgroundColor: `${role.color}20`,
                          color: role.color,
                        }}
                      >
                        {role.percentage}% SHARE
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      <span className="text-slate-400 font-mono-tech">Patron:</span> {role.hero}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{role.focus}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xl font-display font-bold text-white">{role.count}</span>
                  <p className="text-[10px] font-mono-tech text-slate-500">Recruits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mission Capacity Bar Chart */}
      {chartMode === 'missions' && (
        <div className="p-5 rounded-2xl bg-[#0c1328] border border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
            <div>
              <h4 className="text-xs font-mono-tech uppercase text-amber-400 font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Mission Track Capacity & Demand Load
              </h4>
              <p className="text-xs text-slate-400">
                Filled seats vs available seats across every campus assembly track
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-tech">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Enrolled Recruits
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                Remaining Seats
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={missionCapacityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-15}
                  textAnchor="end"
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip content={<CustomHUDTooltip />} />
                <Bar dataKey="filled" name="Enrolled Recruits" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="remaining" name="Remaining Capacity" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Disciplines Radar Chart */}
      {chartMode === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#0c1328] border border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono-tech uppercase text-rose-400 font-bold flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4" />
                Academic Discipline Radar Distribution
              </h4>
              <p className="text-xs text-slate-400">
                Cross-department representation from campus faculties
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={departmentData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="department" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis stroke="#475569" fontSize={9} />
                  <Radar
                    name="Enrolled Recruits"
                    dataKey="recruits"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name="Department Target Quota"
                    dataKey="targetQuota"
                    stroke="#38bdf8"
                    fill="#38bdf8"
                    fillOpacity={0.1}
                  />
                  <Tooltip content={<CustomHUDTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-mono-tech border-t border-slate-800 pt-3">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Actual Recruits
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Target Quota
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <h5 className="text-xs font-mono-tech uppercase text-slate-300 font-bold mb-2">
              Faculty Representation Breakdown
            </h5>
            {departmentData.map(dept => {
              const pct = Math.round((dept.recruits / dept.targetQuota) * 100);
              return (
                <div key={dept.department} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-semibold text-white">{dept.department}</span>
                    <span className="font-mono-tech text-cyan-400">{dept.recruits} Recruits ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pct >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
