"use client";

const heatmapData = [
  { dept: "Engineering", q1: 92, q2: 78, q3: 0, q4: 0 },
  { dept: "Marketing", q1: 85, q2: 60, q3: 0, q4: 0 },
  { dept: "Sales", q1: 100, q2: 88, q3: 0, q4: 0 },
  { dept: "HR", q1: 75, q2: 45, q3: 0, q4: 0 },
  { dept: "Finance", q1: 95, q2: 90, q3: 0, q4: 0 },
];

const getColor = (val: number) => {
  if (val === 0) return "bg-zinc-100 dark:bg-zinc-800 text-zinc-400";
  if (val >= 90) return "bg-emerald-500 text-white";
  if (val >= 70) return "bg-emerald-300 text-emerald-900";
  if (val >= 50) return "bg-amber-300 text-amber-900";
  return "bg-red-300 text-red-900";
};

const trendData = [
  { quarter: "Q1 FY24", completion: 68 },
  { quarter: "Q2 FY24", completion: 72 },
  { quarter: "Q3 FY24", completion: 81 },
  { quarter: "Q4 FY24", completion: 85 },
  { quarter: "Q1 FY25", completion: 79 },
];

const goalDistribution = [
  { area: "Financial", count: 124, pct: 31 },
  { area: "Customer", count: 98, pct: 25 },
  { area: "Process", count: 112, pct: 28 },
  { area: "Learning", count: 66, pct: 16 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Analytics</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">QoQ trends, completion heatmaps, and goal distribution.</p>
      </div>

      {/* QoQ Trend */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">QoQ Completion Trend</h3>
        <div className="flex items-end gap-4 h-48">
          {trendData.map(d => (
            <div key={d.quarter} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white">{d.completion}%</span>
              <div
                className="w-full bg-indigo-500 rounded-t-lg transition-all"
                style={{ height: `${(d.completion / 100) * 160}px` }}
              />
              <span className="text-[10px] text-zinc-500 font-medium">{d.quarter}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Heatmap */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Department Completion Heatmap</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2 text-xs font-bold text-zinc-500 mb-2">
              <div></div>
              <div className="text-center">Q1</div>
              <div className="text-center">Q2</div>
              <div className="text-center">Q3</div>
              <div className="text-center">Q4</div>
            </div>
            {heatmapData.map(row => (
              <div key={row.dept} className="grid grid-cols-5 gap-2 items-center">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{row.dept}</span>
                {[row.q1, row.q2, row.q3, row.q4].map((val, i) => (
                  <div key={i} className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold ${getColor(val)}`}>
                    {val > 0 ? `${val}%` : '-'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Goal Distribution */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Goal Distribution by Thrust Area</h3>
          <div className="space-y-4">
            {goalDistribution.map(d => (
              <div key={d.area}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{d.area}</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">{d.count} ({d.pct}%)</span>
                </div>
                <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
