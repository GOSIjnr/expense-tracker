import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface SpendingChartProps {
    data: any[];
}

export const SpendingChart = ({ data }: SpendingChartProps) => {
    // If no data, show a placeholder driven by empty state or mock
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                Not enough data for chart
            </div>
        )
    }

    // Calculate insights
    const totalSpent = data.reduce((sum, item) => sum + (item.totalSpent || 0), 0);
    const avgDaily = totalSpent / data.length;
    const highestDay = data.reduce((max, item) => item.totalSpent > max.totalSpent ? item : max, data[0]);
    const lowestDay = data.reduce((min, item) => item.totalSpent < min.totalSpent ? item : min, data[0]);

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(data.length / 2);
    const firstHalfAvg = data.slice(0, midPoint).reduce((sum, item) => sum + item.totalSpent, 0) / midPoint;
    const secondHalfAvg = data.slice(midPoint).reduce((sum, item) => sum + item.totalSpent, 0) / (data.length - midPoint);
    const isSpendingDecreasing = secondHalfAvg < firstHalfAvg;

    return (
        <div className="h-full w-full">
            {/* Header with Insights */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white text-lg">Monthly Spending Trend</h3>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isSpendingDecreasing
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                        }`}>
                        {isSpendingDecreasing ? (
                            <>
                                <TrendingDown size={14} />
                                <span>Spending Down</span>
                            </>
                        ) : (
                            <>
                                <TrendingUp size={14} />
                                <span>Spending Up</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 border border-slate-800">
                        <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Daily Average</p>
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">₦{avgDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 border border-slate-800">
                        <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Highest Day</p>
                        <p className="text-xs sm:text-sm font-semibold text-orange-400 truncate">₦{highestDay.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 sm:p-3 border border-slate-800">
                        <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">Lowest Day</p>
                        <p className="text-xs sm:text-sm font-semibold text-emerald-400 truncate">₦{lowestDay.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="75%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={{ stroke: '#334155' }}
                        tickFormatter={(value) => {
                            // Parse date string properly to avoid timezone issues
                            // If value is already a date string like "2026-01-05", split it
                            const parts = value.split('-');
                            if (parts.length === 3) {
                                const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            }
                            // Fallback for other formats
                            return new Date(value + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={{ stroke: '#334155' }}
                        tickFormatter={(value) => `₦${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            border: '1px solid #334155',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                        formatter={(value) => [`₦${Number(value ?? 0).toFixed(2)}`, 'Spent']}
                        labelFormatter={(label) => {
                            // Parse date properly to avoid timezone issues
                            const parts = label.split('-');
                            if (parts.length === 3) {
                                const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                            }
                            return new Date(label + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="totalSpent"
                        stroke="url(#strokeGradient)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                        activeDot={{
                            r: 7,
                            strokeWidth: 3,
                            stroke: '#fff',
                            fill: '#3b82f6'
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
