import { useEffect, useState } from 'react';
import { Plus, Trash2, Wallet, Target, TrendingUp, Loader2, Sparkles, PieChart } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ConfirmModal } from '../components/ConfirmModal';
import { budgetService } from '../services/budgetService';
import { expenseService } from '../services/expenseService';
import { useToast } from '../context/ToastContext';
import type { Budget, CreateBudgetDto } from '../types';

const EmptyState = ({ onAddClick }: { onAddClick: () => void }) => (
    <div className="col-span-full py-20 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-8 group cursor-pointer" onClick={onAddClick}>
            <div className="absolute inset-0 bg-violet-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500/20 to-pink-500/20 flex items-center justify-center ring-1 ring-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <Wallet className="w-12 h-12 text-violet-400 drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30 animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Budgets Set</h3>
        <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
            Create budgets to set spending limits and stay on track with your financial goals.
        </p>
        <Button onClick={onAddClick} className="btn-glow text-white shadow-lg shadow-violet-500/25 px-8 py-3 h-auto text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-none">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Budget
        </Button>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="glass-card p-6 text-center hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-center mb-3">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shadow-inner">
                        <Target size={24} />
                    </div>
                </div>
                <h4 className="text-white font-medium mb-1">Set Limits</h4>
                <p className="text-sm text-gray-400">Control spending by category</p>
            </div>
            <div className="glass-card p-6 text-center hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-center mb-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shadow-inner">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <h4 className="text-white font-medium mb-1">Track Progress</h4>
                <p className="text-sm text-gray-400">See how you're doing</p>
            </div>
            <div className="glass-card p-6 text-center hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-center mb-3">
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 shadow-inner">
                        <PieChart size={24} />
                    </div>
                </div>
                <h4 className="text-white font-medium mb-1">Stay Aware</h4>
                <p className="text-sm text-gray-400">Get spending insights</p>
            </div>
        </div>
    </div>
);

export const Budgets = () => {
    const toast = useToast();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; budgetId: string | null }>({
        isOpen: false,
        budgetId: null
    });

    const [newBudget, setNewBudget] = useState<CreateBudgetDto>({
        limit: 0,
        category: 0,
        period: new Date().toISOString().split('T')[0] // Backend expects period as DateOnly
    });

    const categories = expenseService.getCategories();

    useEffect(() => {
        fetchBudgets();
    }, []);

    const fetchBudgets = async () => {
        try {
            setLoading(true);
            const data = await budgetService.getAll();
            setBudgets(data);
        } catch (error) {
            console.error('Failed to fetch budgets', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await budgetService.create(newBudget);
            setIsModalOpen(false);
            fetchBudgets();
            const categoryName = categories.find(c => c.id === newBudget.category)?.name || 'Category';
            toast.success('Budget Created', `₦${newBudget.limit.toFixed(2)} budget set for ${categoryName}.`);
        } catch (error) {
            // Error toast is handled by API interceptor
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteConfirm({ isOpen: true, budgetId: id });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.budgetId) {
            try {
                await budgetService.delete(deleteConfirm.budgetId);
                setBudgets(budgets.filter(b => b.id !== deleteConfirm.budgetId));
                toast.success('Budget Deleted', 'The budget has been removed successfully.');
            } catch (error) {
                // Error toast is handled by API interceptor
            }
        }
    };

    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Budgets</h1>
                    <p className="text-gray-400 mt-1">Set limits and track your financial discipline</p>
                </div>
                <div className="flex items-center gap-4">
                    {budgets.length > 0 && (
                        <div className="glass-card px-4 py-2 flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Total Budget:</span>
                            <span className="text-white font-bold">₦{totalBudget.toLocaleString()}</span>
                        </div>
                    )}
                    <Button onClick={() => setIsModalOpen(true)} className="btn-glow text-white shadow-lg shadow-violet-500/25 h-auto py-2.5 px-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-none">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Budget
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget) => {
                        const spent = budget.spent || 0;
                        const rawPercentage = (spent / budget.limit) * 100;
                        const displayPercentage = Math.min(rawPercentage, 100); // For progress bar
                        const categoryName = budget.category || 'General';
                        const isOverBudget = spent > budget.limit;
                        const isWarning = rawPercentage >= 80 && rawPercentage < 100;
                        const overAmount = Math.max(0, spent - budget.limit);

                        return (
                            <div key={budget.id} className={`glass-card p-6 transition-all duration-300 hover:transform hover:translate-y-[-4px] hover:shadow-xl group relative overflow-hidden ${isOverBudget ? 'border-rose-500/30 shadow-none' : ''}`}>
                                {isOverBudget && <div className="absolute inset-0 bg-rose-500/5 pointer-events-none" />}

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3.5 rounded-2xl shadow-inner ${isOverBudget ? 'bg-rose-500/10 text-rose-400' : isWarning ? 'bg-amber-500/10 text-amber-400' : 'bg-violet-500/10 text-violet-400'}`}>
                                            <Wallet size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{categoryName}</h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Monthly Budget</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(budget.id)}
                                        className="p-2 -mr-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Over Budget Alert */}
                                {isOverBudget && (
                                    <div className="mb-4 px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        <p className="text-rose-400 text-xs font-bold uppercase tracking-wide">
                                            Over by ₦{overAmount.toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                <div className="mb-3 flex justify-between items-end">
                                    <div>
                                        <span className={`text-2xl font-bold ${isOverBudget ? 'text-rose-400' : 'text-white'}`}>
                                            ₦{spent.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 text-sm ml-1.5">spent</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-400 text-sm">of ₦{budget.limit.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="h-3 bg-slate-950/50 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isOverBudget ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : isWarning ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]'}`}
                                        style={{ width: `${displayPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12" />
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-between text-xs font-medium">
                                    <span className={`${isOverBudget ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-violet-400'}`}>
                                        {rawPercentage.toFixed(0)}% used
                                    </span>
                                    <span className={isOverBudget ? 'text-rose-400' : 'text-gray-400'}>
                                        {isOverBudget ? 'Budget exceeded' : `₦${(budget.limit - spent).toLocaleString()} remaining`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {budgets.length === 0 && <EmptyState onAddClick={() => setIsModalOpen(true)} />}
                </div>
            )}

            {/* Create Budget Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-card-elevated w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-white mb-6">Create New Budget</h2>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                                <select
                                    className="input-glass appearance-none bg-slate-900"
                                    value={newBudget.category}
                                    onChange={(e) => setNewBudget({ ...newBudget, category: parseInt(e.target.value) })}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Budget Limit"
                                type="number"
                                required
                                placeholder="e.g. 50000"
                                value={newBudget.limit}
                                onChange={(e) => setNewBudget({ ...newBudget, limit: parseFloat(e.target.value) })}
                            />

                            <Input
                                label="Budget Period (Month)"
                                type="month"
                                required
                                value={newBudget.period.slice(0, 7)}
                                onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value + '-01' })}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Create Budget</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, budgetId: null })}
                onConfirm={confirmDelete}
                title="Delete Budget?"
                message="Are you sure you want to delete this budget? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};
