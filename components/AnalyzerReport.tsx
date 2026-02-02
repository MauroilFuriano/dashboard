import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Percent,
  AlertTriangle,
  Maximize2
} from 'lucide-react';

// --- 1. DATI REALI DAL BACKTEST (v4.3) ---
const KPI_METRICS = {
  netProfit: 10032.87,
  netProfitPct: 100.33,
  winRate: 69.2,
  profitFactor: 2.68,
  maxDrawdown: -10.1,
  totalTrades: 91,
  avgTrade: 110.22,
  startDate: "2022-02-17",
  endDate: "2025-01-17"
};

const EXIT_REASONS_DATA = [
  { name: 'Trailing Stop Hit', value: 66, color: '#10b981' },
  { name: 'Stop Loss Hit', value: 24, color: '#f43f5e' },
  { name: 'End of Data', value: 1, color: '#3b82f6' },
];

const EQUITY_DATA = [
  { date: '2022-02-17', equity: 10000.0, dd: 0 },
  { date: '2022-02-28', equity: 10032.52, dd: 0 },
  { date: '2022-03-31', equity: 10198.41, dd: -1.26 },
  { date: '2022-04-30', equity: 9637.27, dd: -6.69 },
  { date: '2022-05-31', equity: 9574.5, dd: -7.3 },
  { date: '2022-06-30', equity: 9402.31, dd: -8.97 },
  { date: '2022-07-31', equity: 10096.66, dd: -3.69 },
  { date: '2022-08-31', equity: 10174.03, dd: -2.95 },
  { date: '2022-09-30', equity: 10207.97, dd: -2.63 },
  { date: '2022-10-31', equity: 10362.47, dd: -1.16 },
  { date: '2022-11-30', equity: 10404.83, dd: -0.75 },
  { date: '2022-12-31', equity: 10369.68, dd: -1.09 },
  { date: '2023-01-31', equity: 11352.47, dd: -0.93 },
  { date: '2023-02-28', equity: 11405.04, dd: -1.81 },
  { date: '2023-03-31', equity: 12002.62, dd: -0.87 },
  { date: '2023-04-30', equity: 11838.36, dd: -2.22 },
  { date: '2023-05-31', equity: 11966.97, dd: -1.16 },
  { date: '2023-06-30', equity: 12249.59, dd: -1.07 },
  { date: '2023-07-31', equity: 12170.37, dd: -1.71 },
  { date: '2023-08-31', equity: 12204.89, dd: -1.43 },
  { date: '2023-09-30', equity: 12485.89, dd: -0.23 },
  { date: '2023-10-31', equity: 13248.95, dd: -0.4 },
  { date: '2023-11-30', equity: 13340.12, dd: -0.91 },
  { date: '2023-12-31', equity: 13622.23, dd: -2.89 },
  { date: '2024-01-31', equity: 13375.98, dd: -5.49 },
  { date: '2024-02-29', equity: 15457.75, dd: -1.59 },
  { date: '2024-03-31', equity: 16415.97, dd: -0.34 },
  { date: '2024-04-30', equity: 16072.07, dd: -3.89 },
  { date: '2024-05-31', equity: 16647.3, dd: -1.48 },
  { date: '2024-06-30', equity: 16297.1, dd: -5.11 },
  { date: '2024-07-31', equity: 16922.34, dd: -3.86 },
  { date: '2024-08-31', equity: 16618.53, dd: -5.58 },
  { date: '2024-09-30', equity: 16712.78, dd: -5.05 },
  { date: '2024-10-31', equity: 17357.24, dd: -1.38 },
  { date: '2024-11-30', equity: 18612.71, dd: -0.72 },
  { date: '2024-12-31', equity: 18865.22, dd: -2.04 },
  { date: '2025-01-17', equity: 20032.87, dd: -0.54 }
];

// --- 2. COMPONENTI HELPER ---

const KPICard = ({ label, value, subValue, icon: Icon, trend }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-slate-800 rounded-lg">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
          {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {trend === 'up' ? 'Good' : 'Risk'}
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-2xl font-bold text-slate-100">{value}</span>
      {subValue && <span className="text-sm text-slate-500">{subValue}</span>}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        <p className="text-emerald-400 font-bold text-sm">
          Equity: ${payload[0].value.toLocaleString()}
        </p>
        {payload[1] && (
          <p className="text-rose-400 font-medium text-xs mt-1">
            Drawdown: {payload[1].value}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

// --- 3. COMPONENTE PRINCIPALE ---

export default function AnalyzerReport() {
  const [timeRange, setTimeRange] = useState('ALL');

  return (
    <div className="bg-slate-950 text-slate-200 p-0 font-sans w-full">

      {/* HEADER */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="text-emerald-500" />
            Bot BTC Trend (Mercato Spot) <span className="text-slate-500 text-lg font-normal">/ Backtest Report</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Analysis Period: <span className="text-slate-300">{KPI_METRICS.startDate}</span> to <span className="text-slate-300">{KPI_METRICS.endDate}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {['1Y', 'ALL'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
            >
              {range}
            </button>
          ))}
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white">
            <Maximize2 size={18} />
          </button>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Net Profit"
          value={`$${KPI_METRICS.netProfit.toLocaleString()}`}
          subValue={`+${KPI_METRICS.netProfitPct}%`}
          icon={DollarSign}
          trend="up"
        />
        <KPICard
          label="Profit Factor"
          value={KPI_METRICS.profitFactor}
          subValue="Gross P/L Ratio"
          icon={TrendingUp}
          trend={KPI_METRICS.profitFactor > 1.5 ? 'up' : 'down'}
        />
        <KPICard
          label="Win Rate"
          value={`${KPI_METRICS.winRate}%`}
          subValue={`${KPI_METRICS.totalTrades} Trades`}
          icon={Percent}
          trend={KPI_METRICS.winRate > 50 ? 'up' : 'down'}
        />
        <KPICard
          label="Max Drawdown"
          value={`${KPI_METRICS.maxDrawdown}%`}
          subValue="Peak to Valley"
          icon={AlertTriangle}
          trend="down"
        />
      </div>

      {/* GRAFICI BACKTEST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* COLONNA SINISTRA (2/3): Grafici Principali */}
        <div className="lg:col-span-2 space-y-6 min-w-0">

          {/* EQUITY CURVE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-[400px] min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Equity
                <span className="w-2 h-2 rounded-full bg-rose-500/50 ml-2"></span> Drawdown
              </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={EQUITY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
                  }}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(val) => `$${val / 1000}k`}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEquity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* UNDERWATER PLOT */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm h-[200px] min-w-0">
            <h3 className="text-sm font-semibold text-slate-400 mb-4">Underwater Drawdown</h3>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={EQUITY_DATA} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="step" dataKey="dd" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COLONNA DESTRA (1/3): Pie Chart */}
        <div className="space-y-6">

          {/* EXIT REASON DISTRIBUTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col items-center">
            <h3 className="text-lg font-semibold text-white w-full mb-2">Exit Distribution</h3>
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={EXIT_REASONS_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {EXIT_REASONS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2 mt-4">
              {EXIT_REASONS_DATA.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value} trades</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

