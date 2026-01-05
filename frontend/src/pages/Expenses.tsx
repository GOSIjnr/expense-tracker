import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Calendar, Trash2, Edit2, Loader2, Receipt, TrendingDown, Sparkles, Target, FileText, BarChart3, Lightbulb, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ConfirmModal } from '../components/ConfirmModal';
import { expenseService } from '../services/expenseService';
import { goalService } from '../services/goalService';
import { useToast } from '../context/ToastContext';
import type { Expense, CreateExpenseDto, SavingGoal, CreateSavingGoalDto } from '../types';

const EmptyState = ({ onAddClick }: { onAddClick: () => void }) => (
    <div className="py-20 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative mb-8 group cursor-pointer" onClick={onAddClick}>
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 flex items-center justify-center ring-1 ring-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <Receipt className="w-12 h-12 text-blue-400 drop-shadow-lg" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
            </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Expenses Yet</h3>
        <p className="text-gray-400 text-center max-w-md mb-8 leading-relaxed">
            Start tracking your spending to gain insights into where your money goes. It only takes a few seconds!
        </p>
        <Button onClick={onAddClick} className="btn-glow text-white shadow-lg shadow-primary/25 px-8 py-3 h-auto text-base">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Expense
        </Button>

        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            <div className="glass-card p-6 text-center hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-center mb-3">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
                <h4 className="text-white font-medium mb-1">Log Daily</h4>
                <p className="text-sm text-gray-400">Track purchases as they happen</p>
            </div>
            <div className="glass-card p-6 text-center hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-center mb-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                </div>
                <h4 className="text-white font-medium mb-1">Categorize</h4>
                <p className="text-sm text-gray-400">Organize your spending habits</p>
            </div>
            <div className="glass-card p-6 text-center hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-center mb-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                </div>
                <h4 className="text-white font-medium mb-1">Analyze</h4>
                <p className="text-sm text-gray-400">Spot patterns & save money</p>
            </div>
        </div>
    </div>
);

export const Expenses = () => {
    const toast = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
    const [isCreatingGoal, setIsCreatingGoal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; expenseId: string | null }>({
        isOpen: false,
        expenseId: null
    });
    const [newGoal, setNewGoal] = useState<CreateSavingGoalDto>({
        title: '',
        targetAmount: 0,
        deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });

    const [newExpense, setNewExpense] = useState<CreateExpenseDto>({
        amount: 0,
        category: 0,
        dateOfExpense: new Date().toISOString().split('T')[0],
        paymentMethod: 0,
        description: ''
    });

    const paymentMethods = [
        { id: 0, name: 'Cash' },
        { id: 1, name: 'Card' },
        { id: 2, name: 'Bank Transfer' },
        { id: 3, name: 'Mobile Payment' },
        { id: 4, name: 'POS' },
        { id: 5, name: 'Online Gateway' },
        { id: 6, name: 'Other' },
    ];

    const categories = expenseService.getCategories();

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [showDateFilters, setShowDateFilters] = useState(false);

    // Helpers to handle both ID (number/string) and Name (string) from backend
    const getCategoryName = (val: string | number) => {
        if (val === undefined || val === null) return 'Unknown';
        if (typeof val === 'number' || !isNaN(Number(val))) {
            const match = categories.find(c => c.id === Number(val));
            if (match) return match.name;
        }
        return String(val);
    };

    const getPaymentMethodName = (val: string | number) => {
        if (val === undefined || val === null) return 'Unknown';
        if (typeof val === 'number' || !isNaN(Number(val))) {
            const match = paymentMethods.find(p => p.id === Number(val));
            if (match) return match.name;
        }
        return String(val);
    };

    const filteredExpenses = expenses.filter(expense => {
        // Search Filter
        const matchesSearch =
            expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCategoryName(expense.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.amount.toString().includes(searchTerm);

        if (!matchesSearch) return false;

        // Category Filter
        if (categoryFilter !== 'all') {
            const filterName = categories.find(c => c.id === categoryFilter)?.name;
            const expName = getCategoryName(expense.category);
            if (expName !== filterName) return false;
        }

        // Date Filter
        if (dateFilter !== 'all') {
            const date = new Date(expense.dateOfExpense);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (dateFilter === 'week' && diffDays > 7) return false;
            if (dateFilter === 'month' && diffDays > 30) return false;
            if (dateFilter === 'year' && diffDays > 365) return false;
        }

        return true;
    });

    useEffect(() => {
        fetchExpenses();
        fetchGoals();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const data = await expenseService.getAll();
            setExpenses(data);
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGoals = async () => {
        try {
            const data = await goalService.getAll();
            setSavingGoals(data);
        } catch (error) {
            console.error('Failed to fetch goals', error);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteConfirm({ isOpen: true, expenseId: id });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.expenseId) {
            try {
                await expenseService.delete(deleteConfirm.expenseId);
                setExpenses(expenses.filter(e => e.id !== deleteConfirm.expenseId));
                toast.success('Expense Deleted', 'The expense has been removed successfully.');
            } catch (error) {
                // Error toast is handled by API interceptor
            }
        }
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await goalService.create(newGoal);
            await fetchGoals();
            setNewExpense({ ...newExpense, savingGoalId: created.id });
            setIsCreatingGoal(false);
            setNewGoal({
                title: '',
                targetAmount: 0,
                deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            });
            toast.success('Goal Created', `"${created.title}" has been created and linked.`);
        } catch (error) {
            // Error toast is handled by API interceptor
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await expenseService.create(newExpense);
            setIsModalOpen(false);
            fetchExpenses();
            // Refresh goals if linked
            if (newExpense.savingGoalId) {
                fetchGoals();
            }
            setNewExpense({
                amount: 0,
                category: 0,
                dateOfExpense: new Date().toISOString().split('T')[0],
                paymentMethod: 0,
                description: ''
            });
            toast.success('Expense Added', `₦${newExpense.amount.toFixed(2)} expense has been recorded.`);
        } catch (error) {
            // Error toast is handled by API interceptor
        }
    };

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const todayDate = new Date().toISOString().split('T')[0];

    const totalMonth = expenses
        .filter(e => {
            const d = new Date(e.dateOfExpense);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const totalToday = expenses
        .filter(e => {
            const d = new Date(e.dateOfExpense);
            // Handle date string comparison (YYYY-MM-DD)
            const expenseDate = d.toISOString().split('T')[0];
            return expenseDate === todayDate;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Expenses</h1>
                    <p className="text-gray-400 mt-1">Manage and track your daily spending</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="btn-glow text-white shadow-lg shadow-primary/25 h-auto py-2.5 px-5">
                    <Plus className="w-5 h-5 mr-2" />
                    New Expense
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Spent */}
                <div className="glass-card-elevated p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-rose-500/20" />
                    <div className="relative z-10">
                        <p className="text-rose-400 text-sm font-medium uppercase tracking-wide">Total Spent</p>
                        <h2 className="text-3xl font-bold text-white mt-2">₦{totalAmount.toLocaleString()}</h2>
                        <div className="mt-4 p-2 inline-flex rounded-lg bg-rose-500/10 text-rose-400">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* This Month */}
                <div className="glass-card-elevated p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20" />
                    <div className="relative z-10">
                        <p className="text-blue-400 text-sm font-medium uppercase tracking-wide">This Month</p>
                        <h2 className="text-3xl font-bold text-white mt-2">₦{totalMonth.toLocaleString()}</h2>
                        <div className="mt-4 p-2 inline-flex rounded-lg bg-blue-500/10 text-blue-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Today */}
                <div className="glass-card-elevated p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20" />
                    <div className="relative z-10">
                        <p className="text-emerald-400 text-sm font-medium uppercase tracking-wide">Today</p>
                        <h2 className="text-3xl font-bold text-white mt-2">₦{totalToday.toLocaleString()}</h2>
                        <div className="mt-4 p-2 inline-flex rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            {expenses.length > 0 && (
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            className="input-glass pl-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Button
                            variant="outline"
                            className={`glass-card border-none hover:bg-white/5 ${categoryFilter !== 'all' ? 'text-primary' : 'text-gray-300'}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {categoryFilter !== 'all' ? categories.find(c => c.id === categoryFilter)?.name : 'Filter'}
                        </Button>
                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { setCategoryFilter('all'); setShowFilters(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${categoryFilter === 'all' ? 'text-primary' : 'text-gray-300'}`}
                                >
                                    All Categories
                                </button>
                                {categories.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => { setCategoryFilter(c.id); setShowFilters(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${categoryFilter === c.id ? 'text-primary' : 'text-gray-300'}`}
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Button
                            variant="outline"
                            className={`glass-card border-none hover:bg-white/5 ${dateFilter !== 'all' ? 'text-primary' : 'text-gray-300'}`}
                            onClick={() => setShowDateFilters(!showDateFilters)}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            {dateFilter === 'all' ? 'Date Range' : dateFilter === 'week' ? 'Last 7 Days' : dateFilter === 'month' ? 'Last 30 Days' : 'Last Year'}
                        </Button>
                        {showDateFilters && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { setDateFilter('all'); setShowDateFilters(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${dateFilter === 'all' ? 'text-primary' : 'text-gray-300'}`}
                                >
                                    All Time
                                </button>
                                <button
                                    onClick={() => { setDateFilter('week'); setShowDateFilters(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${dateFilter === 'week' ? 'text-primary' : 'text-gray-300'}`}
                                >
                                    Last 7 Days
                                </button>
                                <button
                                    onClick={() => { setDateFilter('month'); setShowDateFilters(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${dateFilter === 'month' ? 'text-primary' : 'text-gray-300'}`}
                                >
                                    Last 30 Days
                                </button>
                                <button
                                    onClick={() => { setDateFilter('year'); setShowDateFilters(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${dateFilter === 'year' ? 'text-primary' : 'text-gray-300'}`}
                                >
                                    Last Year
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Expenses Table */}
            <div className="glass-card overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredExpenses.length === 0 ? (
                    expenses.length === 0 ? (
                        <EmptyState onAddClick={() => setIsModalOpen(true)} />
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <p>No expenses matches your search.</p>
                        </div>
                    )
                ) : (
                    <>
                        {/* Desktop Table */}
                        <table className="w-full text-left border-collapse hidden md:table">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-5 font-semibold text-gray-300 text-sm">Description</th>
                                    <th className="p-5 font-semibold text-gray-300 text-sm">Category</th>
                                    <th className="p-5 font-semibold text-gray-300 text-sm">Payment Method</th>
                                    <th className="p-5 font-semibold text-gray-300 text-sm">Date</th>
                                    <th className="p-5 font-semibold text-gray-300 text-sm text-right">Amount</th>
                                    <th className="p-5 font-semibold text-gray-300 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-slate-900/50 rounded-xl text-gray-400 border border-white/5 group-hover:border-white/10 transition-colors">
                                                    <TrendingDown size={18} />
                                                </div>
                                                <span className="font-medium text-white">{expense.description || 'No description'}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                {getCategoryName(expense.category)}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-gray-300 text-sm flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                {getPaymentMethodName(expense.paymentMethod)}
                                            </span>
                                        </td>
                                        <td className="p-5 text-gray-400 text-sm">
                                            {expense.dateOfExpense && new Date(expense.dateOfExpense).getFullYear() > 1
                                                ? new Date(expense.dateOfExpense).toLocaleDateString()
                                                : 'Not set'}
                                        </td>
                                        <td className="p-5 text-right font-bold text-rose-400 text-base">
                                            -₦{expense.amount.toFixed(2)}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 hover:bg-rose-500/10 rounded-lg text-gray-400 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile List Cards */}
                        <div className="md:hidden space-y-2 p-4">
                            {filteredExpenses.map((expense) => (
                                <div key={expense.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-900/50 rounded-lg text-gray-400">
                                                <TrendingDown size={16} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm">{expense.description || 'No description'}</p>
                                                <p className="text-xs text-gray-500">{expense.dateOfExpense ? new Date(expense.dateOfExpense).toLocaleDateString() : 'No date'}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-rose-400">-₦{expense.amount.toFixed(2)}</p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                        <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {getCategoryName(expense.category)}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-gray-500" />
                                            {getPaymentMethodName(expense.paymentMethod)}
                                        </span>
                                        <div className="ml-auto flex gap-1">
                                            <button onClick={() => handleDelete(expense.id)} className="p-1.5 text-gray-400 hover:text-rose-500">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Add Expense Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-card-elevated w-full max-w-lg shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-white mb-6">Add New Expense</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label="Description"
                                placeholder="e.g., Grocery Shopping"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Amount"
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Payment Method</label>
                                    <select
                                        className="input-glass appearance-none bg-slate-900"
                                        value={newExpense.paymentMethod}
                                        onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: parseInt(e.target.value) })}
                                    >
                                        {paymentMethods.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-300">Category</label>
                                    <select
                                        className="input-glass appearance-none bg-slate-900"
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: parseInt(e.target.value) })}
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Date"
                                    type="date"
                                    required
                                    value={newExpense.dateOfExpense ? newExpense.dateOfExpense.split('T')[0] : ''}
                                    onChange={(e) => setNewExpense({ ...newExpense, dateOfExpense: e.target.value })}
                                />
                            </div>

                            {/* Saving Goal Selection - Only show when Savings (6) or Investments (7) category is selected */}
                            {(newExpense.category === 6 || newExpense.category === 7) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Link to Saving Goal (Optional)</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                            value={newExpense.savingGoalId || ''}
                                            onChange={(e) => setNewExpense({ ...newExpense, savingGoalId: e.target.value || undefined })}
                                        >
                                            <option value="">No goal (General savings)</option>
                                            {savingGoals.map(goal => (
                                                <option key={goal.id} value={goal.id}>
                                                    {goal.title} (₦{goal.currentAmount.toLocaleString()} / ₦{goal.targetAmount.toLocaleString()})
                                                </option>
                                            ))}
                                        </select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsCreatingGoal(true)}
                                            className="whitespace-nowrap"
                                        >
                                            <Target className="w-4 h-4 mr-1" />
                                            New Goal
                                        </Button>
                                    </div>
                                    {newExpense.savingGoalId && (
                                        <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            This expense will contribute to your selected goal
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-8">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Create Expense</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick Create Goal Modal */}
            {isCreatingGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Quick Create Goal</h2>
                                <p className="text-sm text-gray-400">This will be linked to your expense</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreateGoal} className="space-y-4">
                            <Input
                                label="Goal Title"
                                placeholder="e.g. New Car, Dream Vacation"
                                required
                                value={newGoal.title}
                                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                            />

                            <Input
                                label="Target Amount"
                                type="number"
                                required
                                placeholder="e.g. 5000"
                                value={newGoal.targetAmount}
                                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) })}
                            />

                            <Input
                                label="Deadline (Optional)"
                                type="date"
                                value={newGoal.deadline?.split('T')[0] || ''}
                                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsCreatingGoal(false)}>Cancel</Button>
                                <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                                    Create & Link Goal
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, expenseId: null })}
                onConfirm={confirmDelete}
                title="Delete Expense?"
                message="Are you sure you want to delete this expense? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};
