import { AlertTriangle, TrendingUp, Target, Lightbulb, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { type PredictiveInsights } from '../services/analyticsService';
import { Link } from 'react-router-dom';

interface AIInsightsWidgetProps {
    insights: PredictiveInsights;
}

export const AIInsightsWidget = ({ insights }: AIInsightsWidgetProps) => {
    // 1. Determine the "Hero" Insight (Highest Priority)
    const getHeroInsight = () => {
        // Priority 1: Budget Warnings (Critical)
        if (insights.budgetWarnings.length > 0) {
            return {
                type: 'warning',
                data: insights.budgetWarnings[0],
                icon: AlertTriangle,
                title: 'Budget Alert',
                color: 'rose',
                bgGradient: 'from-rose-500/10 to-orange-500/10',
                border: 'border-rose-500/20',
                text: 'text-rose-400',
                action: { label: 'Adjust Budget', to: '/budgets' }
            };
        }

        // Priority 2: Goal Predictions (Off Track)
        const offTrackGoal = insights.goalPredictions.find(g => g.status === 'behind' || g.status === 'at-risk');
        if (offTrackGoal) {
            return {
                type: 'goal',
                data: offTrackGoal,
                icon: Target,
                title: 'Goal at Risk',
                color: 'amber',
                bgGradient: 'from-amber-500/10 to-orange-500/10',
                border: 'border-amber-500/20',
                text: 'text-amber-400',
                action: { label: 'View Goal', to: '/goals' }
            };
        }

        // Priority 3: Savings Opportunities (Positive)
        if (insights.savingsOpportunities.length > 0) {
            return {
                type: 'opportunity',
                data: insights.savingsOpportunities[0],
                icon: TrendingUp,
                title: 'Savings Opportunity',
                color: 'emerald',
                bgGradient: 'from-emerald-500/10 to-teal-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
                action: { label: 'Save Now', to: '/goals' }
            };
        }

        // Priority 4: General Recommendations
        if (insights.recommendations.length > 0) {
            return {
                type: 'recommendation',
                data: insights.recommendations[0],
                icon: Lightbulb,
                title: 'Smart Tip',
                color: 'blue',
                bgGradient: 'from-blue-500/10 to-cyan-500/10',
                border: 'border-blue-500/20',
                text: 'text-blue-400',
                action: null
            };
        }

        return null;
    };

    const hero = getHeroInsight();
    if (!hero) return null;

    // Collect other insights for the side list (excluding the hero)
    const getOtherInsights = () => {
        const list: any[] = [];

        // Add remaining warnings
        insights.budgetWarnings.forEach(w => {
            if (hero.type !== 'warning' || hero.data !== w) {
                list.push({ ...w, icon: AlertTriangle, color: 'text-rose-400', type: 'Warning' });
            }
        });

        // Add remaining opportunities
        insights.savingsOpportunities.forEach(s => {
            if (hero.type !== 'opportunity' || hero.data !== s) {
                list.push({ ...s, icon: TrendingUp, color: 'text-emerald-400', type: 'Opportunity' });
            }
        });

        // Add goals info
        insights.goalPredictions.forEach(g => {
            if (hero.type !== 'goal' || hero.data !== g) {
                const isGood = g.status === 'ahead' || g.status === 'on-track';
                list.push({
                    message: g.message,
                    icon: Target,
                    color: isGood ? 'text-emerald-400' : 'text-amber-400',
                    type: 'Goal Forecast'
                });
            }
        });

        // Add remaining recommendations
        insights.recommendations.forEach(r => {
            if (hero.type !== 'recommendation' || hero.data !== r) {
                list.push({ ...r, icon: Lightbulb, color: 'text-blue-400', type: 'Tip' });
            }
        });

        return list.slice(0, 3); // Limit to 3 items
    };

    const sideList = getOtherInsights();
    const HeroIcon = hero.icon;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Hero Card */}
            <div className={`lg:col-span-2 relative overflow-hidden rounded-2xl border ${hero.border} bg-surface p-1`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${hero.bgGradient} opacity-50`} />
                <div className="relative p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center h-full">
                    <div className={`w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center shrink-0 shadow-lg`}>
                        <HeroIcon className={`w-8 h-8 ${hero.text}`} />
                    </div>
                    <div className="flex-1">
                        <div className={`flex items-center gap-2 mb-2 ${hero.text} font-medium tracking-wide uppercase text-xs`}>
                            <Sparkles className="w-3 h-3" />
                            {hero.title}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                            {hero.data.message}
                        </h3>
                        {hero.data.suggestedAction && (
                            <p className="text-gray-400 text-sm mb-4">
                                {hero.data.suggestedAction}
                            </p>
                        )}

                        {hero.action && (
                            <Link
                                to={hero.action.to}
                                className={`inline-flex items-center gap-2 text-sm font-semibold ${hero.text} hover:opacity-80 transition-opacity`}
                            >
                                {hero.action.label} <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Intelligence List */}
            <div className="bg-surface border border-slate-800 rounded-2xl p-6 flex flex-col">
                <h4 className="text-gray-400 text-sm font-medium mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Other Insights
                </h4>

                {sideList.length > 0 ? (
                    <div className="space-y-4 flex-1">
                        {sideList.map((item, idx) => {
                            const ItemIcon = item.icon;
                            return (
                                <div key={idx} className="flex gap-3 group">
                                    <div className="mt-0.5">
                                        <div className={`w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center group-hover:bg-slate-800 transition-colors`}>
                                            <ItemIcon className={`w-3 h-3 ${item.color}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300 leading-snug group-hover:text-white transition-colors">
                                            {item.message}
                                        </p>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{item.type}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 gap-2">
                        <CheckCircle2 className="w-8 h-8 opacity-20" />
                        <p className="text-sm">You are all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
