import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Upload, TrendingUp, DollarSign, Wallet2,
  BarChart3, CheckCircle2, AlertTriangle,
  Wallet, Repeat, CalendarDays, ShoppingBag,
  Layers,
} from 'lucide-react';
import {
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import Papa from 'papaparse';

import { fmtEUR } from './lib/format';
import { DEFAULT_CATEGORIES, withCategoryFallback } from './lib/categories';
import { tooltipStyle, COLORS } from './lib/chartTheme';
import { useCountUp } from './hooks/useCountUp';
import { PrivacyContext, Amount } from './components/PrivacyContext';
import ThemeStyles from './components/ThemeStyles';
import AppHeader from './components/AppHeader';
import TabNav from './components/TabNav';
import StatCard from './components/StatCard';
import SectionCard from './components/SectionCard';
import ExpandingChart from './components/ExpandingChart';
import NumberField from './components/NumberField';
import Snackbar from './components/Snackbar';
import AmountListSection from './components/AmountListSection';
import UnusualExpensesSection from './components/UnusualExpensesSection';
import DistributedExpensesSection from './components/DistributedExpensesSection';
import ExportDataSection from './components/ExportDataSection';

// A rolling 12-month window starting this month, rather than a fixed historical
// range — this mode has no career-transition end date to plan around.
const buildMonths = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  });
};

const BudgetTracker = ({ onSwitchMode }) => {
  const months = useMemo(buildMonths, []);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [income, setIncome] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_generic_income');
    if (saved) return JSON.parse(saved);
    // Illustrative demo figures only — a comfortable, ordinary household budget.
    return {
      monthlyIncome: 2800,
      otherIncome: 150,
    };
  });

  const [fixedMonthly, setFixedMonthly] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_generic_fixedMonthly');
    return saved
      ? withCategoryFallback(JSON.parse(saved))
      : [
          { id: 1, name: 'Investments', amount: 200, category: 'Miscellaneous' },
          { id: 2, name: 'Flat Loan', amount: 600, category: 'Household' },
          { id: 3, name: 'Electricity', amount: 80, category: 'Household' },
          { id: 4, name: 'Building Maintenance Fee', amount: 120, category: 'Household' },
          { id: 5, name: 'Internet', amount: 35, category: 'Household' },
        ];
  });

  const [fixedAnnual, setFixedAnnual] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_generic_fixedAnnual');
    return saved
      ? withCategoryFallback(JSON.parse(saved))
      : [{ id: 1, name: 'Insurance', amount: 600, category: 'Household' }];
  });

  const [variableMonthly, setVariableMonthly] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_generic_variableMonthly');
    return saved
      ? withCategoryFallback(JSON.parse(saved))
      : [
          { id: 1, name: 'Groceries', amount: 350, category: 'Groceries' },
          { id: 2, name: 'Transportation', amount: 90, category: 'Transportation' },
          { id: 3, name: 'Dining Out', amount: 120, category: 'Dining Out' },
        ];
  });

  const [unusualExpenses, setUnusualExpenses] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_generic_unusualExpenses');
    return saved
      ? withCategoryFallback(JSON.parse(saved))
      : [
          { id: 1, name: 'New Laptop', amount: 1200, month: months[0], isDefault: true, category: 'Shopping & Clothing' },
          { id: 2, name: 'Car Repair', amount: 600, month: months[1], isDefault: true, category: 'Transportation' },
          { id: 3, name: 'Weekend Trip', amount: 400, month: months[2], isDefault: true, category: 'Travel' },
        ];
  });

  // Categories, dark mode, and privacy-blur are shared preferences, not
  // financial data — same localStorage keys as the severance tracker, so
  // switching modes never disagrees with itself about how you like to view
  // the app. Only the money (income/expenses above) is namespaced per mode.
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('budgetTracker_categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    setCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    return trimmed;
  };

  const [distributedExpenses, setDistributedExpenses] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_generic_distributedExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [uploadedExpenses, setUploadedExpenses] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_generic_uploadedExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingExpense, setEditingExpense] = useState({ type: null, id: null });
  const [csvError, setCsvError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [hideAmounts, setHideAmounts] = useState(
    () => localStorage.getItem('budgetTracker_hideAmounts') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('budgetTracker_hideAmounts', hideAmounts.toString());
  }, [hideAmounts]);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('budgetTracker_darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('budgetTracker_darkMode', darkMode.toString());
  }, [darkMode]);

  // Same reasoning as the severance tracker: the literal pastel palette reads
  // beautifully on the dark surface but fails contrast on white, so light mode
  // uses a deepened variant of the same hue.
  const incomeColor = darkMode ? '#55D6A7' : '#20835F';
  const expenseColor = darkMode ? '#D7C0EC' : '#9251CD';

  const [snackbar, setSnackbar] = useState(null);
  const snackbarTimeoutRef = useRef(null);
  const showSnackbar = (message, onUndo) => {
    if (snackbarTimeoutRef.current) clearTimeout(snackbarTimeoutRef.current);
    setSnackbar({ message, onUndo, key: Date.now() });
    snackbarTimeoutRef.current = setTimeout(() => setSnackbar(null), 5000);
  };

  const [showSavedPing, setShowSavedPing] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    localStorage.setItem('budgetTracker_generic_income', JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_generic_fixedMonthly', JSON.stringify(fixedMonthly));
  }, [fixedMonthly]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_generic_fixedAnnual', JSON.stringify(fixedAnnual));
  }, [fixedAnnual]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_generic_variableMonthly', JSON.stringify(variableMonthly));
  }, [variableMonthly]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_generic_unusualExpenses', JSON.stringify(unusualExpenses));
  }, [unusualExpenses]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_generic_distributedExpenses', JSON.stringify(distributedExpenses));
  }, [distributedExpenses]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_generic_uploadedExpenses', JSON.stringify(uploadedExpenses));
  }, [uploadedExpenses]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setShowSavedPing(true);
    const t = setTimeout(() => setShowSavedPing(false), 1600);
    return () => clearTimeout(t);
  }, [income, fixedMonthly, fixedAnnual, variableMonthly, unusualExpenses, distributedExpenses]);

  const processCsvFile = (file) => {
    if (!file) return;
    setCsvError(null);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setCsvError(`${results.errors.length} row(s) couldn't be read — please check the file format.`);
        }
        setUploadedExpenses(results.data);
        showSnackbar(`${results.data.length} expense rows imported`);
      },
    });
  };

  const handleCSVUpload = (e) => processCsvFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    processCsvFile(file);
  };

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = {
      income, fixedMonthly, fixedAnnual, variableMonthly,
      unusualExpenses, distributedExpenses, uploadedExpenses,
      exportedAt: new Date().toISOString(),
    };
    downloadBlob(
      JSON.stringify(data, null, 2),
      `budget-tracker-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  const handleExportCSV = () => {
    const rows = [
      { Section: 'Income', Name: 'Monthly income', Category: '', Amount: income.monthlyIncome, Month: '', Notes: '' },
      { Section: 'Income', Name: 'Other income (monthly)', Category: '', Amount: income.otherIncome, Month: '', Notes: '' },
    ];
    fixedMonthly.forEach((i) => rows.push({ Section: 'Fixed Monthly Expense', Name: i.name, Category: i.category || '', Amount: i.amount, Month: '', Notes: '' }));
    fixedAnnual.forEach((i) => rows.push({ Section: 'Fixed Annual Expense', Name: i.name, Category: i.category || '', Amount: i.amount, Month: '', Notes: '' }));
    variableMonthly.forEach((i) => rows.push({ Section: 'Variable Monthly Expense', Name: i.name, Category: i.category || '', Amount: i.amount, Month: '', Notes: '' }));
    unusualExpenses.forEach((i) => rows.push({ Section: 'One-off Expense', Name: i.name, Category: i.category || '', Amount: i.amount, Month: i.month, Notes: '' }));
    distributedExpenses.forEach((i) =>
      rows.push({
        Section: 'Spread-out Expense',
        Name: i.name,
        Category: '',
        Amount: i.totalAmount,
        Month: i.startMonth,
        Notes: `${i.months} months`,
      })
    );
    uploadedExpenses.forEach((e) =>
      rows.push({
        Section: 'Uploaded Expense',
        Name: e.Category || e.category || 'Uncategorized',
        Category: e.Category || e.category || 'Uncategorized',
        Amount: e.Amount || e.amount || 0,
        Month: e.Date || e.date || '',
        Notes: '',
      })
    );

    downloadBlob(
      Papa.unparse(rows),
      `budget-tracker-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  // Period-backup/reset flow (step 7): download a full backup, then clear
  // this mode's data only — never severance mode's, since it lives in its
  // own localStorage namespace. Kept undoable via the same snackbar pattern
  // every other delete in this app already uses.
  const startNewPeriod = () => {
    const snapshot = {
      income, fixedMonthly, fixedAnnual, variableMonthly,
      unusualExpenses, distributedExpenses, uploadedExpenses,
    };
    handleExportCSV();
    handleExportJSON();
    setIncome({ monthlyIncome: 0, otherIncome: 0 });
    setFixedMonthly([]);
    setFixedAnnual([]);
    setVariableMonthly([]);
    setUnusualExpenses([]);
    setDistributedExpenses([]);
    setUploadedExpenses([]);
    showSnackbar('Backup downloaded — this period cleared for a fresh start', () => {
      setIncome(snapshot.income);
      setFixedMonthly(snapshot.fixedMonthly);
      setFixedAnnual(snapshot.fixedAnnual);
      setVariableMonthly(snapshot.variableMonthly);
      setUnusualExpenses(snapshot.unusualExpenses);
      setDistributedExpenses(snapshot.distributedExpenses);
      setUploadedExpenses(snapshot.uploadedExpenses);
    });
  };

  const addItem = (items, setItems) => {
    const newItem = { id: Date.now(), name: '', amount: 0, category: 'Miscellaneous' };
    setItems([...items, newItem]);
    setEditingExpense({ type: 'current', id: newItem.id });
  };

  const addUnusualExpense = () => {
    const newExpense = {
      id: Date.now(), name: '', amount: 0, month: months[0], isDefault: false, category: 'Miscellaneous',
    };
    setUnusualExpenses([...unusualExpenses, newExpense]);
    setEditingExpense({ type: 'unusual', id: newExpense.id });
  };

  const addDistributedExpense = () => {
    const newExpense = {
      id: Date.now(),
      name: '',
      totalAmount: 0,
      monthlyAmount: 0,
      months: 6,
      startMonth: months[0],
    };
    setDistributedExpenses([...distributedExpenses, newExpense]);
    setEditingExpense({ type: 'distributed', id: newExpense.id });
  };

  const removeItem = (items, setItems, id, label) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const removed = items[idx];
    setItems(items.filter((item) => item.id !== id));
    showSnackbar(`"${label || 'Untitled expense'}" deleted`, () => {
      setItems((prev) => {
        const copy = [...prev];
        copy.splice(idx, 0, removed);
        return copy;
      });
    });
  };

  const updateItem = (items, setItems, id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'totalAmount' || field === 'months') {
            updated.monthlyAmount = updated.totalAmount / (updated.months || 1);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const totalFixedMonthly = fixedMonthly.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalVariableMonthly = variableMonthly.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalUnusualExpenses = unusualExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalAnnualExpenses = fixedAnnual.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalDistributedExpenses = distributedExpenses.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
  const totalUploadedExpenses = uploadedExpenses.reduce(
    (sum, expense) => sum + Math.abs(parseFloat(expense.Amount || expense.amount || 0)),
    0
  );

  const getDistributedExpenseForThisMonth = () => {
    let total = 0;
    distributedExpenses.forEach((expense) => {
      const startIndex = months.indexOf(expense.startMonth);
      if (startIndex === 0 || (startIndex <= 0 && startIndex + (expense.months || 0) > 0)) {
        total += parseFloat(expense.monthlyAmount) || 0;
      }
    });
    return total;
  };

  const currentMonthLabel = months[0];
  const monthlyIncomeTotal = (parseFloat(income.monthlyIncome) || 0) + (parseFloat(income.otherIncome) || 0);
  const currentMonthExpenses = totalFixedMonthly + totalVariableMonthly + getDistributedExpenseForThisMonth();
  const currentMonthRemaining = monthlyIncomeTotal - currentMonthExpenses;
  const monthStatus =
    currentMonthRemaining < 0 ? 'over' : currentMonthRemaining < monthlyIncomeTotal * 0.2 ? 'caution' : 'ok';

  // Unified spending-by-category view: manually-typed expenses and uploaded
  // CSV rows all feed the same totals, keyed by the same category names.
  const categoryData = useMemo(() => {
    const totals = {};
    const add = (category, amount) => {
      const key = category || 'Miscellaneous';
      totals[key] = (totals[key] || 0) + amount;
    };

    fixedMonthly.forEach((item) => add(item.category, parseFloat(item.amount) || 0));
    fixedAnnual.forEach((item) => add(item.category, parseFloat(item.amount) || 0));
    variableMonthly.forEach((item) => add(item.category, parseFloat(item.amount) || 0));
    unusualExpenses.forEach((item) => add(item.category, parseFloat(item.amount) || 0));
    uploadedExpenses.forEach((expense) => {
      const category = expense.Category || expense.category || 'Uncategorized';
      const amount = Math.abs(parseFloat(expense.Amount || expense.amount || 0));
      add(category, amount);
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [fixedMonthly, fixedAnnual, variableMonthly, unusualExpenses, uploadedExpenses]);

  // Annualized (×12) so monthly, annual, and one-off figures sit on comparable
  // footing — a normal calendar year, unlike the severance tracker's fixed
  // 13-month career-transition horizon.
  const expenseCompositionData = [
    { name: 'Fixed Monthly', value: totalFixedMonthly * 12 },
    { name: 'Fixed Annual', value: totalAnnualExpenses },
    { name: 'Variable Monthly', value: totalVariableMonthly * 12 },
    { name: 'One-off', value: totalUnusualExpenses },
    { name: 'Spread-out', value: totalDistributedExpenses },
  ].filter((d) => d.value > 0);

  const heroIncome = useCountUp(monthlyIncomeTotal);
  const heroExpenses = useCountUp(currentMonthExpenses);
  const heroRemaining = useCountUp(currentMonthRemaining);

  const STATUS_BANNER = {
    over: { bg: 'bg-[#FDEDEA]', text: 'text-[#5C1A14]', Icon: AlertTriangle, message: 'You are over budget this month.' },
    caution: {
      bg: 'bg-[#FFF6E5]', text: 'text-[#5C4200]', Icon: AlertTriangle,
      message: "Less than 20% of this month's budget remains.",
    },
    ok: { bg: 'bg-[#E7F6EC]', text: 'text-[#0D3D1D]', Icon: CheckCircle2, message: "You're on track this month." },
  };
  const bannerInfo = STATUS_BANNER[monthStatus];
  const BannerIcon = bannerInfo.Icon;

  return (
    <PrivacyContext.Provider value={hideAmounts}>
    <div className="min-h-screen bg-[#F7F7FB] text-[#1B1B21] bg-texture">
      <ThemeStyles />

      <AppHeader
        icon={Wallet2}
        iconBg="#132A1D"
        title="Budget Tracker"
        subtitle="Everyday income & expenses"
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showSavedPing={showSavedPing}
        onSwitchMode={onSwitchMode}
      />

      <TabNav
        tabs={[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'settings', label: 'Income & Expenses', icon: Wallet },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hideAmounts={hideAmounts}
        setHideAmounts={setHideAmounts}
      />

      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <div key="dashboard" className="animate-fadein space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <StatCard
                icon={DollarSign}
                label="Monthly Income"
                value={<Amount value={heroIncome} />}
                tone="primary"
                sub="Income + other sources"
                delay={0}
              />
              <StatCard
                icon={ShoppingBag}
                label="Monthly Expenses"
                value={<Amount value={heroExpenses} />}
                tone="accent"
                sub="Fixed + variable spending"
                delay={80}
              />
              <StatCard
                icon={Wallet2}
                label={`Remaining (${currentMonthLabel})`}
                value={<Amount value={heroRemaining} />}
                tone={currentMonthRemaining >= 0 ? 'success' : 'warn'}
                sub={currentMonthRemaining >= 0 ? "On track this month" : 'Over budget this month'}
                delay={160}
              />
            </div>

            <SectionCard title={`This Month: ${currentMonthLabel}`} icon={TrendingUp} delay={120}>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#46464F]">Monthly Budget</span>
                    <span className="text-base font-semibold" style={{ color: incomeColor }}><Amount value={monthlyIncomeTotal} /></span>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#46464F]">Planned Expenses</span>
                    <span className="text-base font-semibold" style={{ color: expenseColor }}><Amount value={currentMonthExpenses} /></span>
                  </div>
                  <div className="border-t border-black/5 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1B1B21]">Remaining</span>
                      <span className={`text-2xl font-bold ${currentMonthRemaining >= 0 ? 'text-[#1E8E3E]' : 'text-[#B3261E]'}`}>
                        <Amount value={currentMonthRemaining} />
                      </span>
                    </div>
                  </div>
                </div>

                <ExpandingChart baseHeight={220} expandedHeight={250}>
                  <div className="relative h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Remaining', value: Math.max(0, currentMonthRemaining) },
                            { name: 'Spent', value: currentMonthExpenses },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          cornerRadius={8}
                          stroke="none"
                          dataKey="value"
                        >
                          <Cell fill="#1E8E3E" />
                          <Cell fill={expenseColor} />
                        </Pie>
                        <Tooltip
                          formatter={(value) => (hideAmounts ? '•••••' : fmtEUR(value))}
                          contentStyle={tooltipStyle}
                          position={{ y: 175 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm text-[#79747E]">Budget Usage</span>
                      <span className="text-2xl font-bold text-[#1B1B21]">
                        {monthlyIncomeTotal > 0 ? ((currentMonthExpenses / monthlyIncomeTotal) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                </ExpandingChart>
              </div>

              <div className={`flex items-center gap-3 rounded-2xl ${bannerInfo.bg} ${bannerInfo.text} px-4 py-3.5`}>
                <BannerIcon size={18} className={monthStatus === 'ok' ? 'animate-pulse-soft' : ''} />
                <p className="text-sm font-medium">{bannerInfo.message}</p>
              </div>
            </SectionCard>

            {categoryData.length > 0 && (
              <SectionCard title="Expense Breakdown by Category" icon={ShoppingBag} delay={0}>
                <ExpandingChart baseHeight={300} expandedHeight={330}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        paddingAngle={2}
                        cornerRadius={6}
                        stroke="none"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => (hideAmounts ? '•••••' : fmtEUR(value))} contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </ExpandingChart>
              </SectionCard>
            )}

            <SectionCard title="Expense Composition" icon={Layers} delay={0}>
              <ExpandingChart baseHeight={300} expandedHeight={330}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCompositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={100}
                      paddingAngle={3}
                      cornerRadius={6}
                      stroke="none"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseCompositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => (hideAmounts ? '•••••' : fmtEUR(value))}
                      contentStyle={tooltipStyle}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ExpandingChart>
            </SectionCard>
          </div>
        )}

        {activeTab === 'settings' && (
          <div key="settings" className="animate-fadein space-y-6">
            <SectionCard title="Income Sources" icon={Wallet} delay={0}>
              <div className="mb-5 flex items-center justify-between rounded-2xl bg-[#F5F2FA] px-4 py-3">
                <span className="text-sm font-medium text-[#46464F]">Estimated monthly income</span>
                <span className="text-lg font-semibold text-[#375DFB]"><Amount value={monthlyIncomeTotal} digits={2} /></span>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <NumberField
                  label="Monthly income"
                  value={income.monthlyIncome}
                  onChange={(v) => setIncome({ ...income, monthlyIncome: v })}
                  help="Salary or wage, after tax"
                />
                <NumberField
                  label="Other income (monthly)"
                  value={income.otherIncome}
                  onChange={(v) => setIncome({ ...income, otherIncome: v })}
                  help="Freelance, rental, side income, etc."
                />
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AmountListSection
                title="Fixed Monthly Expenses"
                icon={Repeat}
                items={fixedMonthly}
                setItems={setFixedMonthly}
                editingExpense={editingExpense}
                setEditingExpense={setEditingExpense}
                updateItem={updateItem}
                onAdd={() => addItem(fixedMonthly, setFixedMonthly)}
                onRemove={removeItem}
                total={totalFixedMonthly}
                addLabel="Add fixed monthly expense"
                emptyText="No fixed monthly expenses yet."
                delay={0}
                categories={categories}
                onAddCategory={addCategory}
              />

              <AmountListSection
                title="Fixed Annual Expenses"
                icon={CalendarDays}
                items={fixedAnnual}
                setItems={setFixedAnnual}
                editingExpense={editingExpense}
                setEditingExpense={setEditingExpense}
                updateItem={updateItem}
                onAdd={() => addItem(fixedAnnual, setFixedAnnual)}
                onRemove={removeItem}
                total={totalAnnualExpenses}
                addLabel="Add fixed annual expense"
                emptyText="No fixed annual expenses yet."
                delay={0}
                categories={categories}
                onAddCategory={addCategory}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AmountListSection
                title="Variable Monthly Expenses"
                icon={ShoppingBag}
                items={variableMonthly}
                setItems={setVariableMonthly}
                editingExpense={editingExpense}
                setEditingExpense={setEditingExpense}
                updateItem={updateItem}
                onAdd={() => addItem(variableMonthly, setVariableMonthly)}
                onRemove={removeItem}
                total={totalVariableMonthly}
                addLabel="Add variable monthly expense"
                emptyText="No variable monthly expenses yet."
                delay={0}
                categories={categories}
                onAddCategory={addCategory}
              />

              <SectionCard title="Upload Expense Data" icon={Upload} delay={0}>
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                    dragActive ? 'border-[#375DFB] bg-[#EEF1FF]' : 'border-[#C6C6D0] bg-[#F5F2FA] hover:border-[#375DFB] hover:bg-[#EEF1FF]'
                  }`}
                >
                  <Upload className="text-[#375DFB]" size={26} />
                  <span className="text-base font-medium text-[#1B1B21]">Drop a CSV here, or click to browse</span>
                  <span className="text-xs text-[#79747E]">Columns: Date, Amount, Category</span>
                  <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                </label>
                {uploadedExpenses.length > 0 && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-medium text-[#1E8E3E]">
                    <CheckCircle2 size={16} /> {uploadedExpenses.length} expense entries loaded
                  </p>
                )}
                {csvError && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-medium text-[#B3261E]">
                    <AlertTriangle size={16} /> {csvError}
                  </p>
                )}
              </SectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <UnusualExpensesSection
                items={unusualExpenses}
                setItems={setUnusualExpenses}
                editingExpense={editingExpense}
                setEditingExpense={setEditingExpense}
                updateItem={updateItem}
                onAdd={addUnusualExpense}
                onRemove={removeItem}
                months={months}
                total={totalUnusualExpenses}
                delay={0}
                categories={categories}
                onAddCategory={addCategory}
              />

              <ExportDataSection
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
                onStartFresh={startNewPeriod}
                delay={0}
              />
            </div>

            <DistributedExpensesSection
              items={distributedExpenses}
              setItems={setDistributedExpenses}
              editingExpense={editingExpense}
              setEditingExpense={setEditingExpense}
              updateItem={updateItem}
              onAdd={addDistributedExpense}
              onRemove={removeItem}
              months={months}
              delay={0}
            />
          </div>
        )}
      </div>

      <Snackbar snackbar={snackbar} onClose={() => setSnackbar(null)} />
    </div>
    </PrivacyContext.Provider>
  );
};

export default BudgetTracker;
