import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, DollarSign, TrendingUp, Calendar, RefreshCw, Search, X, Briefcase, Monitor, Building2, BarChart2, Home, Gift, Wallet, FileText } from 'lucide-react';
import {
    incomeService,
    type Income,
    type CreateIncomeRequest,
    IncomeSource,
    RecurrenceFrequency,
    getIncomeSourceColor
} from '../services/incomeService';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

// Icon component for income sources using Lucide icons
const IncomeSourceIcon = ({ source, size = 20 }: { source: IncomeSource; size?: number }) => {
    const iconProps = { size, className: 'text-white' };
    switch (source) {
        case IncomeSource.Salary: return <Briefcase {...iconProps} />;
        case IncomeSource.Freelance: return <Monitor {...iconProps} />;
        case IncomeSource.Business: return <Building2 {...iconProps} />;
        case IncomeSource.Investments: return <BarChart2 {...iconProps} />;
        case IncomeSource.Rental: return <Home {...iconProps} />;
        case IncomeSource.Gift: return <Gift {...iconProps} />;
        case IncomeSource.Refund: return <Wallet {...iconProps} />;
        case IncomeSource.Other: return <FileText {...iconProps} />;
        default: return <DollarSign {...iconProps} />;
    }
};

// Empty state component
const EmptyState = ({ onAddClick }: { onAddClick: () => void }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-6">
            <DollarSign className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No income recorded</h3>
        <p className="text-gray-400 text-center max-w-md mb-6">
            Start tracking your income to get a complete picture of your finances.
        </p>
        <button
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-medium shadow-lg shadow-emerald-500/25"
        >
            <Plus size={20} />
            Add Your First Income
        </button>
    </div>
);

export default function Income() {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSource, setFilterSource] = useState<IncomeSource | ''>('');
    const toast = useToast();

    // Form state
    const [formData, setFormData] = useState<CreateIncomeRequest>({
        source: IncomeSource.Salary,
        amount: 0,
        dateReceived: new Date().toISOString().split('T')[0],
        description: '',
        isRecurring: false,
        frequency: undefined
    });

    const fetchIncomes = async () => {
        setIsLoading(true);
        try {
            const data = await incomeService.getAll();
            setIncomes(data);
        } catch {
            // Error handled by global handler
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingIncome) {
                await incomeService.update(editingIncome.id, {
                    id: editingIncome.id,
                    ...formData
                });
                toast.success('Income Updated', 'Income record updated successfully');
            } else {
                await incomeService.create(formData);
                toast.success('Income Added', 'New income record created successfully');
            }
            setIsModalOpen(false);
            setEditingIncome(null);
            resetForm();
            fetchIncomes();
        } catch {
            // Error handled by global handler
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await incomeService.delete(id);
            toast.success('Income Deleted', 'Income record deleted successfully');
            setDeleteConfirm(null);
            fetchIncomes();
        } catch {
            // Error handled by global handler
        }
    };

    const handleEdit = (income: Income) => {
        setEditingIncome(income);
        setFormData({
            source: income.source,
            amount: income.amount,
            dateReceived: income.dateReceived.split('T')[0],
            description: income.description || '',
            isRecurring: income.isRecurring,
            frequency: income.frequency
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            source: IncomeSource.Salary,
            amount: 0,
            dateReceived: new Date().toISOString().split('T')[0],
            description: '',
            isRecurring: false,
            frequency: undefined
        });
    };

    const openNewModal = () => {
        setEditingIncome(null);
        resetForm();
        setIsModalOpen(true);
    };

    // Filter incomes
    const filteredIncomes = incomes.filter(income => {
        const matchesSearch = !searchQuery ||
            income.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            income.sourceName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSource = !filterSource || income.source === filterSource;
        return matchesSearch && matchesSource;
    });

    // Calculate totals
    const totalIncome = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Income</h1>
                    <p className="text-gray-400 mt-1">Track and manage your revenue streams</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="btn-glow-secondary text-white inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={20} />
                    Add Income
                </button>
            </div>

            {/* Summary Card */}
            <div className="glass-card-elevated p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-500 group-hover:bg-emerald-500/20" />

                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-emerald-400 text-sm font-medium tracking-wide uppercase">Total Income</p>
                        <p className="text-4xl font-bold text-white mt-2 tracking-tight">
                            ₦{totalIncome.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {filteredIncomes.length} transaction{filteredIncomes.length !== 1 ? 's' : ''} this period
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 shadow-inner">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search income..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-glass pl-12"
                    />
                </div>
                <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value as IncomeSource | '')}
                    className="input-glass sm:w-48 appearance-none cursor-pointer"
                >
                    <option value="" className="bg-slate-900">All Sources</option>
                    {Object.values(IncomeSource).map(source => (
                        <option key={source} value={source} className="bg-slate-900">{source}</option>
                    ))}
                </select>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
            ) : incomes.length === 0 ? (
                <EmptyState onAddClick={openNewModal} />
            ) : (
                <div className="grid gap-4">
                    {filteredIncomes.map(income => (
                        <div
                            key={income.id}
                            className="glass-card p-4 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 group"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                                        style={{ backgroundColor: `${getIncomeSourceColor(income.source)}20`, border: `1px solid ${getIncomeSourceColor(income.source)}30` }}
                                    >
                                        <div style={{ color: getIncomeSourceColor(income.source) }}>
                                            <IncomeSourceIcon source={income.source} size={22} />
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                            <span className="font-semibold text-white text-lg">{income.sourceName}</span>
                                            {income.isRecurring && (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                                                    <RefreshCw size={10} />
                                                    {income.frequencyName}
                                                </span>
                                            )}
                                        </div>
                                        {income.description && (
                                            <p className="text-gray-400 text-sm truncate">{income.description}</p>
                                        )}
                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1.5">
                                            <Calendar size={12} />
                                            {new Date(income.dateReceived).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-emerald-400 font-bold text-xl whitespace-nowrap drop-shadow-sm">
                                        +₦{income.amount.toLocaleString()}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(income)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(income.id)}
                                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="glass-card-elevated w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-white/5">
                            <h2 className="text-xl font-semibold text-white">
                                {editingIncome ? 'Edit Income' : 'Add Income'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Source */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value as IncomeSource })}
                                    className="input-glass appearance-none"
                                    required
                                >
                                    {Object.values(IncomeSource).map(source => (
                                        <option key={source} value={source} className="bg-slate-900">
                                            {source}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Amount (₦)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="number"
                                        value={formData.amount || ''}
                                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                        className="input-glass pl-10 font-mono"
                                        placeholder="0.00"
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Date Received</label>
                                <input
                                    type="date"
                                    value={formData.dateReceived}
                                    onChange={(e) => setFormData({ ...formData, dateReceived: e.target.value })}
                                    className="input-glass"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input-glass"
                                    placeholder="e.g., January salary"
                                />
                            </div>

                            {/* Recurring */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    checked={formData.isRecurring}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        isRecurring: e.target.checked,
                                        frequency: e.target.checked ? RecurrenceFrequency.Monthly : undefined
                                    })}
                                    className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                                />
                                <label htmlFor="isRecurring" className="text-sm text-gray-300 font-medium">
                                    This is recurring income
                                </label>
                            </div>

                            {/* Frequency */}
                            {formData.isRecurring && (
                                <div className="animate-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
                                    <select
                                        value={formData.frequency || ''}
                                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurrenceFrequency })}
                                        className="input-glass appearance-none"
                                    >
                                        {Object.values(RecurrenceFrequency).map(freq => (
                                            <option key={freq} value={freq} className="bg-slate-900">{freq}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-white/5 text-gray-300 rounded-xl hover:bg-white/10 transition-colors font-medium border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 btn-glow-secondary text-white rounded-xl transition-all font-medium text-sm"
                                >
                                    {editingIncome ? 'Update' : 'Add Income'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                title="Delete Income"
                message="Are you sure you want to delete this income record? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
