import { useEffect, useState } from 'react';
import { Plus, Target, Trash2, Loader2, Sparkles, Trophy, Rocket, Calendar, Palmtree, Car, Home, Wallet } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ConfirmModal } from '../components/ConfirmModal';
import { goalService } from '../services/goalService';
import { useToast } from '../context/ToastContext';
import type { SavingGoal, CreateSavingGoalDto } from '../types';

const EmptyState = ({ onAddClick }: { onAddClick: () => void }) => (
    <div className="col-span-full py-20 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-8 group cursor-pointer" onClick={onAddClick}>
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex items-center justify-center ring-1 ring-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <Target className="w-12 h-12 text-emerald-400 drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Start Your Savings Journey</h3>
        <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
            Set meaningful goals and watch your dreams come to life. Whether it's a vacation, a new gadget, or an emergency fund – every goal matters.
        </p>
        <Button onClick={onAddClick} className="btn-glow-secondary text-white shadow-lg shadow-emerald-500/25 px-8 py-3 h-auto text-base">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Goal
        </Button>

        {/* Inspiration Section */}
        <div className="mt-12 w-full max-w-3xl">
            <h4 className="text-center text-gray-400 text-xs font-bold tracking-widest uppercase mb-6 opacity-70">Popular Saving Goals</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card hover:bg-white/5 transition-all cursor-pointer group p-4 text-center transform hover:scale-105" onClick={onAddClick}>
                    <div className="flex items-center justify-center mb-3"><Palmtree className="w-8 h-8 text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-md" /></div>
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Vacation</p>
                </div>
                <div className="glass-card hover:bg-white/5 transition-all cursor-pointer group p-4 text-center transform hover:scale-105" onClick={onAddClick}>
                    <div className="flex items-center justify-center mb-3"><Car className="w-8 h-8 text-violet-400 group-hover:text-violet-300 transition-colors drop-shadow-md" /></div>
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">New Car</p>
                </div>
                <div className="glass-card hover:bg-white/5 transition-all cursor-pointer group p-4 text-center transform hover:scale-105" onClick={onAddClick}>
                    <div className="flex items-center justify-center mb-3"><Home className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors drop-shadow-md" /></div>
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Home</p>
                </div>
                <div className="glass-card hover:bg-white/5 transition-all cursor-pointer group p-4 text-center transform hover:scale-105" onClick={onAddClick}>
                    <div className="flex items-center justify-center mb-3"><Wallet className="w-8 h-8 text-amber-400 group-hover:text-amber-300 transition-colors drop-shadow-md" /></div>
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Fund</p>
                </div>
            </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shadow-inner">
                    <Trophy size={20} />
                </div>
                <div>
                    <p className="text-white text-sm font-medium">Track Progress</p>
                    <p className="text-xs text-gray-400">Visual progress bars</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shadow-inner">
                    <Calendar size={20} />
                </div>
                <div>
                    <p className="text-white text-sm font-medium">Set Deadlines</p>
                    <p className="text-xs text-gray-400">Stay motivated</p>
                </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 shadow-inner">
                    <Rocket size={20} />
                </div>
                <div>
                    <p className="text-white text-sm font-medium">Achieve Dreams</p>
                    <p className="text-xs text-gray-400">Celebrate success</p>
                </div>
            </div>
        </div>
    </div>
);

export const Goals = () => {
    const toast = useToast();
    const [goals, setGoals] = useState<SavingGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; goalId: string | null }>({
        isOpen: false,
        goalId: null
    });

    const [newGoal, setNewGoal] = useState<CreateSavingGoalDto>({
        title: '',
        targetAmount: 0,
        deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const data = await goalService.getAll();
            setGoals(data);
        } catch (error) {
            console.error('Failed to fetch goals', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await goalService.create(newGoal);
            setIsModalOpen(false);
            fetchGoals();
            toast.success('Goal Created', `"${newGoal.title}" has been set with a target of ₦${newGoal.targetAmount.toLocaleString()}.`);
            setNewGoal({
                title: '',
                targetAmount: 0,
                deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            });
        } catch (error) {
            // Error toast is handled by API interceptor
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteConfirm({ isOpen: true, goalId: id });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.goalId) {
            try {
                await goalService.delete(deleteConfirm.goalId);
                setGoals(goals.filter(g => g.id !== deleteConfirm.goalId));
                toast.success('Goal Deleted', 'The saving goal has been removed.');
            } catch (error) {
                // Error toast is handled by API interceptor
            }
        }
    };

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Saving Goals</h1>
                    <p className="text-gray-400 mt-1">Track your progress towards your financial dreams</p>
                </div>
                <div className="flex items-center gap-4">
                    {goals.length > 0 && (
                        <div className="glass-card px-4 py-2 flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Saved:</span>
                            <span className="text-emerald-400 font-bold ml-1">₦{totalSaved.toLocaleString()}</span>
                            <span className="text-gray-600 mx-1">/</span>
                            <span className="text-gray-400 font-medium">₦{totalTarget.toLocaleString()}</span>
                        </div>
                    )}
                    <Button onClick={() => setIsModalOpen(true)} className="btn-glow-secondary text-white shadow-lg shadow-emerald-500/25 h-auto py-2.5 px-5">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Goal
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                        const isComplete = percentage >= 100;
                        const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

                        return (
                            <div key={goal.id} className={`glass-card p-6 transition-all duration-300 hover:transform hover:translate-y-[-4px] hover:shadow-xl group relative overflow-hidden ${isComplete ? 'border-emerald-500/30' : ''}`}>
                                {isComplete && <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />}

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3.5 rounded-2xl shadow-inner ${isComplete ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-white/5 text-emerald-400'}`}>
                                            {isComplete ? <Trophy size={24} /> : <Target size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{goal.title}</h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mt-1">
                                                {isComplete ? 'Goal Achieved' : daysLeft > 0 ? `${daysLeft} days left` : 'Past deadline'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(goal.id)}
                                        className="p-2 -mr-2 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex items-end justify-between mb-3">
                                    <span className="text-3xl font-bold text-white tracking-tight">₦{goal.currentAmount.toLocaleString()}</span>
                                    <span className="text-sm text-gray-400 font-medium mb-1">of ₦{goal.targetAmount.toLocaleString()}</span>
                                </div>

                                <div className="h-3 bg-slate-950/50 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5 relative">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${isComplete ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]'}`}
                                        style={{ width: `${percentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12" />
                                    </div>
                                </div>

                                <div className="flex justify-between text-xs font-semibold mt-3">
                                    <span className={isComplete ? 'text-emerald-400' : 'text-teal-400'}>{percentage.toFixed(0)}% Complete</span>
                                    <span className="text-gray-500">₦{(goal.targetAmount - goal.currentAmount).toLocaleString()} to go</span>
                                </div>
                            </div>
                        );
                    })}

                    {goals.length === 0 && <EmptyState onAddClick={() => setIsModalOpen(true)} />}
                </div>
            )}

            {/* Create Goal Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-card-elevated w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3.5 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Create Saving Goal</h2>
                                <p className="text-sm text-gray-400 mt-0.5">What are you saving for?</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Goal Title</label>
                                <Input
                                    placeholder="e.g. New Car, Dream Vacation"
                                    required
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    className="input-glass"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Target Amount (₦)</label>
                                <Input
                                    type="number"
                                    required
                                    placeholder="e.g. 5000"
                                    value={newGoal.targetAmount}
                                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) })}
                                    className="input-glass"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Deadline</label>
                                <Input
                                    type="date"
                                    value={newGoal.deadline?.split('T')[0] || ''}
                                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                    className="input-glass"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-white/5 text-gray-400 hover:text-white">Cancel</Button>
                                <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 border-none">
                                    Set Goal
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, goalId: null })}
                onConfirm={confirmDelete}
                title="Delete Saving Goal?"
                message="Are you sure you want to delete this saving goal? This action cannot be undone and all progress will be lost."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};
