import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Upload, TrendingUp, Calendar,
  BarChart3, CheckCircle2, AlertTriangle,
  PiggyBank, Wallet, Repeat, CalendarDays, ShoppingBag,
  Layers,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import Papa from 'papaparse';

import { DEFAULT_CATEGORIES, withCategoryFallback } from './lib/categories';
import { tooltipStyle, COLORS } from './lib/chartTheme';
import { useCountUp } from './hooks/useCountUp';
import { useCurrency, CurrencyIcon } from './components/CurrencyContext';
import { PrivacyContext, Amount, ChartTooltip } from './components/PrivacyContext';
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

const EMPTY_INCOME = {
  severancePay: 0,
  severanceForMonthly: 0,
  unemploymentPay: 0,
  sharesSold: 0,
  freelancerWork: 0,
  garageRent: 0,
  flatRent: 0,
};

const SeveranceBudgetTracker = ({ onSwitchMode }) => {
  const { currency, formatMoney } = useCurrency();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [income, setIncome] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_severance_income');
    if (saved) {
      const parsedIncome = JSON.parse(saved);
      return {
        ...parsedIncome,
        garageRent: parsedIncome.garageRent !== undefined ? parsedIncome.garageRent : 100,
        flatRent: parsedIncome.flatRent !== undefined ? parsedIncome.flatRent : 0,
      };
    }
    // Illustrative demo figures only — not anyone's real numbers. Shown to
    // anyone who opens the app (or this repo) without their own data yet.
    return {
      severancePay: 45000,
      severanceForMonthly: 5000,
      unemploymentPay: 1200,
      sharesSold: 0,
      freelancerWork: 300,
      garageRent: 100,
      flatRent: 0,
    };
  });

  const [fixedMonthly, setFixedMonthly] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_severance_fixedMonthly');
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
    const saved = localStorage.getItem('budgetTracker_severance_fixedAnnual');
    return saved
      ? withCategoryFallback(JSON.parse(saved))
      : [{ id: 1, name: 'Insurance', amount: 600, category: 'Household' }];
  });

  const [variableMonthly, setVariableMonthly] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_severance_variableMonthly');
    return saved
      ? withCategoryFallback(JSON.parse(saved))
      : [
          { id: 1, name: 'Groceries', amount: 350, category: 'Groceries' },
          { id: 2, name: 'Transportation', amount: 90, category: 'Transportation' },
          { id: 3, name: 'Dining Out', amount: 120, category: 'Dining Out' },
        ];
  });

  const [unusualExpenses, setUnusualExpenses] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_severance_unusualExpenses');
    return saved
      ? withCategoryFallback(JSON.parse(saved))
      : [
          { id: 1, name: 'New Laptop', amount: 1200, month: 'Sep 2025', isDefault: true, category: 'Shopping & Clothing' },
          { id: 2, name: 'Car Repair', amount: 600, month: 'Oct 2025', isDefault: true, category: 'Transportation' },
          { id: 3, name: 'Weekend Trip', amount: 400, month: 'Nov 2025', isDefault: true, category: 'Travel' },
        ];
  });

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
    const saved = localStorage.getItem('budgetTracker_severance_distributedExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [uploadedExpenses, setUploadedExpenses] = useState(() => {
    const saved = localStorage.getItem('budgetTracker_severance_uploadedExpenses');
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

  // Income/expense palette (testing): the requested pastels (#BAD7B6 / #D7C0EC)
  // read beautifully as text/chart marks against the dark surface (~12:1 and
  // ~11:1 contrast) but fail badly against white (~1.6:1) — so light mode uses
  // a deepened variant of the same hue instead of the literal pastel.
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
    localStorage.setItem('budgetTracker_severance_income', JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_severance_fixedMonthly', JSON.stringify(fixedMonthly));
  }, [fixedMonthly]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_severance_fixedAnnual', JSON.stringify(fixedAnnual));
  }, [fixedAnnual]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_severance_variableMonthly', JSON.stringify(variableMonthly));
  }, [variableMonthly]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_severance_unusualExpenses', JSON.stringify(unusualExpenses));
  }, [unusualExpenses]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_severance_distributedExpenses', JSON.stringify(distributedExpenses));
  }, [distributedExpenses]);

  useEffect(() => {
    localStorage.setItem('budgetTracker_severance_uploadedExpenses', JSON.stringify(uploadedExpenses));
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

  const months = [
    'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026',
    'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026',
  ];

  const quarters = [
    { name: 'Q4 2025', months: ['Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'] },
    { name: 'Q1 2026', months: ['Jan 2026', 'Feb 2026', 'Mar 2026'] },
    { name: 'Q2 2026', months: ['Apr 2026', 'May 2026', 'Jun 2026'] },
    { name: 'Q3 2026', months: ['Jul 2026', 'Aug 2026', 'Sep 2026'] },
  ];

  const processCsvFile = (file) => {
    if (!file) return;
    setCsvError(null);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setCsvError(`${results.errors.length} row(s) couldn't be read. Please check the file format.`);
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
      currency,
      exportedAt: new Date().toISOString(),
    };
    downloadBlob(
      JSON.stringify(data, null, 2),
      `budget-safety-net-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  const handleExportCSV = () => {
    const rows = [
      { Section: 'Income', Name: 'Severance pay (total)', Category: '', Amount: income.severancePay, Month: '', Notes: '' },
      { Section: 'Income', Name: 'Severance allocated to monthly income', Category: '', Amount: income.severanceForMonthly, Month: '', Notes: '' },
      { Section: 'Income', Name: 'Unemployment insurance (monthly)', Category: '', Amount: income.unemploymentPay, Month: '', Notes: '' },
      { Section: 'Income', Name: 'Shares sold (total)', Category: '', Amount: income.sharesSold, Month: '', Notes: '' },
      { Section: 'Income', Name: 'Freelance work (total)', Category: '', Amount: income.freelancerWork, Month: '', Notes: '' },
      { Section: 'Income', Name: 'Garage rent (monthly)', Category: '', Amount: income.garageRent, Month: '', Notes: '' },
      { Section: 'Income', Name: 'Flat rent (monthly)', Category: '', Amount: income.flatRent, Month: '', Notes: '' },
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
        Name: e.Category || e.category || 'Uncategorised',
        Category: e.Category || e.category || 'Uncategorised',
        Amount: e.Amount || e.amount || 0,
        Month: e.Date || e.date || '',
        Notes: '',
      })
    );

    rows.forEach((row) => { row.Currency = currency; });
    downloadBlob(
      Papa.unparse(rows),
      `budget-safety-net-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  // Period-backup/reset flow (step 7): download a full backup, then clear
  // this mode's data only — never the other mode's, since it lives in its
  // own localStorage namespace. Kept undoable via the same snackbar pattern
  // every other delete in this app already uses.
  const startNewPeriod = () => {
    const snapshot = {
      income, fixedMonthly, fixedAnnual, variableMonthly,
      unusualExpenses, distributedExpenses, uploadedExpenses,
    };
    handleExportCSV();
    handleExportJSON();
    setIncome(EMPTY_INCOME);
    setFixedMonthly([]);
    setFixedAnnual([]);
    setVariableMonthly([]);
    setUnusualExpenses([]);
    setDistributedExpenses([]);
    setUploadedExpenses([]);
    showSnackbar('Backup downloaded. This period is cleared for a fresh start', () => {
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
      id: Date.now(), name: '', amount: 0, month: 'Sep 2025', isDefault: false, category: 'Miscellaneous',
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
      startMonth: 'Sep 2025',
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

  const monthlyFromSeverance = income.severanceForMonthly / 12;
  const totalFixedMonthly = fixedMonthly.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalVariableMonthly = variableMonthly.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalUnusualExpenses = unusualExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalAnnualExpenses = fixedAnnual.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const expensesByMonth = useMemo(() => {
    const byMonth = {};
    uploadedExpenses.forEach((expense) => {
      if (expense.Date || expense.date) {
        const dateStr = expense.Date || expense.date;
        const date = new Date(dateStr);
        const monthKey = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;

        if (!byMonth[monthKey]) {
          byMonth[monthKey] = { total: 0, categories: {} };
        }

        const amount = Math.abs(parseFloat(expense.Amount || expense.amount || 0));
        const category = expense.Category || expense.category || 'Uncategorised';

        byMonth[monthKey].total += amount;
        byMonth[monthKey].categories[category] = (byMonth[monthKey].categories[category] || 0) + amount;
      }
    });
    return byMonth;
  }, [uploadedExpenses]);

  const getDistributedExpenseForMonth = (monthIndex) => {
    let total = 0;
    distributedExpenses.forEach((expense) => {
      const startIndex = months.indexOf(expense.startMonth);
      const endIndex = startIndex + (expense.months || 0);
      if (monthIndex >= startIndex && monthIndex < endIndex) {
        total += parseFloat(expense.monthlyAmount) || 0;
      }
    });
    return total;
  };

  const budgetData = months.map((month, index) => {
    const monthlyIncome =
      income.unemploymentPay +
      monthlyFromSeverance +
      income.freelancerWork / 13 +
      income.sharesSold / 13 +
      (income.garageRent || 0) +
      (income.flatRent || 0);

    const uploadedExpensesForMonth = expensesByMonth[month]?.total || 0;
    const distributedForMonth = getDistributedExpenseForMonth(index);
    const totalMonthlyExpenses = totalFixedMonthly + totalVariableMonthly + distributedForMonth;
    const monthBalance = monthlyIncome - totalMonthlyExpenses - uploadedExpensesForMonth;

    return {
      month,
      income: parseFloat(monthlyIncome.toFixed(2)),
      totalExpenses: parseFloat((totalMonthlyExpenses + uploadedExpensesForMonth).toFixed(2)),
      balance: parseFloat(monthBalance.toFixed(2)),
      cumulative: 0,
    };
  });

  let cumulativeBalance = income.severancePay - income.severanceForMonthly - totalUnusualExpenses - totalAnnualExpenses;
  budgetData.forEach((month) => {
    cumulativeBalance += month.balance;
    month.cumulative = parseFloat(cumulativeBalance.toFixed(2));
  });

  const quarterlyData = quarters.map((quarter) => {
    const quarterMonths = budgetData.filter((m) => quarter.months.includes(m.month));
    return {
      quarter: quarter.name,
      income: quarterMonths.reduce((sum, m) => sum + m.income, 0),
      expenses: quarterMonths.reduce((sum, m) => sum + m.totalExpenses, 0),
      balance: quarterMonths.reduce((sum, m) => sum + m.balance, 0),
    };
  });

  const currentMonth = months[0];
  const currentMonthData = budgetData[0];
  const currentMonthBudget = currentMonthData.income;
  const currentMonthActualExpenses = currentMonthData.totalExpenses;
  const currentMonthRemaining = currentMonthBudget - currentMonthActualExpenses;
  const monthStatus =
    currentMonthRemaining < 0 ? 'over' : currentMonthRemaining < currentMonthBudget * 0.2 ? 'caution' : 'ok';

  // Unified spending-by-category view: manually-typed expenses (fixed, annual,
  // variable, one-off) and uploaded CSV rows all feed the same totals, keyed by
  // the same category names, instead of two disconnected category systems.
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
      const category = expense.Category || expense.category || 'Uncategorised';
      const amount = Math.abs(parseFloat(expense.Amount || expense.amount || 0));
      add(category, amount);
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [fixedMonthly, fixedAnnual, variableMonthly, unusualExpenses, uploadedExpenses]);

  const COLORS = ['#375DFB', '#7C4DFF', '#00ACC1', '#F4A300', '#FF6F61', '#43A047', '#8D6E63', '#5C6BC0'];

  const totalUploadedExpenses = uploadedExpenses.reduce(
    (sum, expense) => sum + Math.abs(parseFloat(expense.Amount || expense.amount || 0)),
    0
  );
  const totalDistributedExpenses = distributedExpenses.reduce(
    (sum, item) => sum + (parseFloat(item.totalAmount) || 0),
    0
  );

  const overallMoneyIn =
    income.severancePay +
    income.unemploymentPay * 13 +
    income.freelancerWork +
    income.sharesSold +
    (income.garageRent + income.flatRent) * 13;
  const overallMoneySpent =
    totalAnnualExpenses +
    totalUnusualExpenses +
    totalFixedMonthly * 13 +
    totalVariableMonthly * 13 +
    totalDistributedExpenses +
    totalUploadedExpenses;
  const overallRemaining = overallMoneyIn - overallMoneySpent;
  const overallUsagePercent = overallMoneyIn > 0 ? (overallMoneySpent / overallMoneyIn) * 100 : 0;

  const expenseCompositionData = [
    { name: 'Fixed Monthly', value: totalFixedMonthly * 13 },
    { name: 'Fixed Annual', value: totalAnnualExpenses },
    { name: 'Variable Monthly', value: totalVariableMonthly * 13 },
    { name: 'One-off', value: totalUnusualExpenses },
    { name: 'Spread-out', value: totalDistributedExpenses },
  ].filter((d) => d.value > 0);

  const currentSeveranceBalance = income.severancePay - income.severanceForMonthly - totalUnusualExpenses - totalAnnualExpenses;
  const projectedEndBalance = budgetData[budgetData.length - 1]?.cumulative || 0;

  const monthlyBurn = totalFixedMonthly + totalVariableMonthly;
  const runwayMonths = monthlyBurn > 0 ? currentSeveranceBalance / monthlyBurn : null;

  const heroSeverance = useCountUp(currentSeveranceBalance);
  const heroIncome = useCountUp(currentMonthBudget);
  const heroProjected = useCountUp(projectedEndBalance);

  const STATUS_BANNER = {
    over: { bg: 'bg-[#FDEDEA]', text: 'text-[#5C1A14]', Icon: AlertTriangle, message: 'You are over budget this month.' },
    caution: {
      bg: 'bg-[#FFF6E5]', text: 'text-[#5C4200]', Icon: AlertTriangle,
      message: "Less than 20% of this month's budget remains.",
    },
    ok: { bg: 'bg-[#E7F6EC]', text: 'text-[#0D3D1D]', Icon: CheckCircle2, message: "You're on track. Nice work protecting your runway." },
  };
  const bannerInfo = STATUS_BANNER[monthStatus];
  const BannerIcon = bannerInfo.Icon;

  const overallStatus = overallRemaining < 0 ? 'over' : overallUsagePercent > 80 ? 'caution' : 'ok';
  const OVERALL_STATUS_BANNER = {
    over: {
      bg: 'bg-[#FDEDEA]', text: 'text-[#5C1A14]', Icon: AlertTriangle,
      message: 'Projected to spend more than comes in over the full plan. Worth a closer look.',
    },
    caution: {
      bg: 'bg-[#FFF6E5]', text: 'text-[#5C4200]', Icon: AlertTriangle,
      message: "You've committed most of your total funds. Keep an eye on the months ahead.",
    },
    ok: {
      bg: 'bg-[#E7F6EC]', text: 'text-[#0D3D1D]', Icon: CheckCircle2,
      message: 'On track overall. The plan holds up well through Sep 2026.',
    },
  };
  const overallBannerInfo = OVERALL_STATUS_BANNER[overallStatus];
  const OverallBannerIcon = overallBannerInfo.Icon;

  return (
    <PrivacyContext.Provider value={hideAmounts}>
    <div className="min-h-screen text-[#1B1B21]">
      <ThemeStyles />

      <AppHeader
        icon={PiggyBank}
        title="Budget Safety Net"
        subtitle="Sep 2025 – Sep 2026 · career transition runway"
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
                icon={CurrencyIcon}
                label="Available Severance"
                value={<Amount value={heroSeverance} />}
                tone="success"
                sub={runwayMonths !== null ? `≈ ${runwayMonths.toFixed(1)} months of runway at current spend` : undefined}
                delay={0}
              />
              <StatCard
                icon={Calendar}
                label="Monthly Income (this month)"
                value={<Amount value={heroIncome} />}
                tone="primary"
                sub="Unemployment insurance + severance + rent"
                delay={80}
              />
              <StatCard
                icon={PiggyBank}
                label="Projected Balance (Sep 2026)"
                value={<Amount value={heroProjected} />}
                tone={projectedEndBalance >= 0 ? 'accent' : 'warn'}
                sub={projectedEndBalance >= 0 ? 'On pace to end with a cushion' : 'On pace to run out before Sep 2026'}
                delay={160}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title={`Current Month: ${currentMonth}`} icon={TrendingUp} delay={120} className="flex h-full flex-col">
              <div className="mb-6 flex-1 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#46464F]">Monthly Budget</span>
                    <span className="text-base font-semibold text-[#3255E4]"><Amount value={currentMonthBudget} /></span>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#46464F]">Planned Expenses</span>
                    <span className="text-base font-semibold" style={{ color: expenseColor }}><Amount value={currentMonthData.totalExpenses} /></span>
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
                            { name: 'Spent', value: currentMonthActualExpenses },
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
                          formatter={(value) => (hideAmounts ? '•••••' : formatMoney(value))}
                          contentStyle={tooltipStyle}
                          position={{ y: 175 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm text-[#645F6C]">Budget Usage</span>
                      <span className="text-2xl font-bold text-[#1B1B21]">
                        {((currentMonthActualExpenses / currentMonthBudget) * 100).toFixed(0)}%
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

            <SectionCard title="Overall Summary" icon={BarChart3} delay={0} className="flex h-full flex-col">
              <div className="mb-2 flex-1 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#46464F]">Total Money In</span>
                    <span className="text-base font-semibold" style={{ color: incomeColor }}><Amount value={overallMoneyIn} /></span>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#46464F]">Total Money Spent</span>
                    <span className="text-base font-semibold" style={{ color: expenseColor }}><Amount value={overallMoneySpent} /></span>
                  </div>
                  <div className="border-t border-black/5 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1B1B21]">Net Remaining</span>
                      <span className={`text-2xl font-bold ${overallRemaining >= 0 ? 'text-[#1E8E3E]' : 'text-[#B3261E]'}`}>
                        <Amount value={overallRemaining} />
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
                            { name: 'Remaining', value: Math.max(0, overallRemaining) },
                            { name: 'Spent', value: overallMoneySpent },
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
                          formatter={(value) => (hideAmounts ? '•••••' : formatMoney(value))}
                          contentStyle={tooltipStyle}
                          position={{ y: 175 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm text-[#645F6C]">Overall Usage</span>
                      <span className="text-2xl font-bold text-[#1B1B21]">{overallUsagePercent.toFixed(0)}%</span>
                    </div>
                  </div>
                </ExpandingChart>
              </div>

              <div className={`flex items-center gap-3 rounded-2xl ${overallBannerInfo.bg} ${overallBannerInfo.text} px-4 py-3.5`}>
                <OverallBannerIcon size={18} className={overallStatus === 'ok' ? 'animate-pulse-soft' : ''} />
                <p className="text-sm font-medium">{overallBannerInfo.message}</p>
              </div>
            </SectionCard>
            </div>

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
                      <Tooltip formatter={(value) => (hideAmounts ? '•••••' : formatMoney(value))} contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </ExpandingChart>
              </SectionCard>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Quarterly Overview" icon={BarChart3} delay={0}>
              <ExpandingChart baseHeight={300} expandedHeight={330}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1E1EA" />
                    <XAxis dataKey="quarter" tick={{ fill: '#46464F', fontSize: 12 }} axisLine={{ stroke: '#E1E1EA' }} />
                    <YAxis tick={{ fill: '#46464F', fontSize: 12 }} axisLine={{ stroke: '#E1E1EA' }} />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: '#375DFB', fillOpacity: 0.15 }}
                      wrapperStyle={{ transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)' }}
                      animationDuration={200}
                      animationEasing="ease-out"
                    />
                    <Legend />
                    <Bar dataKey="income" fill={incomeColor} name="Income" radius={[10, 10, 10, 10]} />
                    <Bar dataKey="expenses" fill={expenseColor} name="Expenses" radius={[10, 10, 10, 10]} />
                    <Line
                      type="natural"
                      dataKey="balance"
                      stroke="#375DFB"
                      strokeWidth={3}
                      strokeLinecap="round"
                      name="Net Balance"
                      dot={{ r: 4, fill: '#375DFB', strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ExpandingChart>
            </SectionCard>

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
                      formatter={(value) => (hideAmounts ? '•••••' : formatMoney(value))}
                      contentStyle={tooltipStyle}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ExpandingChart>
            </SectionCard>
            </div>

            <SectionCard title="13-Month Projection" icon={TrendingUp} delay={0}>
              <ExpandingChart baseHeight={380} expandedHeight={420}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E1E1EA" />
                    <XAxis
                      dataKey="month"
                      angle={-45}
                      textAnchor="end"
                      height={90}
                      tick={{ fill: '#46464F', fontSize: 11 }}
                      axisLine={{ stroke: '#E1E1EA' }}
                    />
                    <YAxis tick={{ fill: '#46464F', fontSize: 12 }} axisLine={{ stroke: '#E1E1EA' }} />
                    <Tooltip formatter={(value) => (hideAmounts ? '•••••' : formatMoney(value))} contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="natural" dataKey="income" stroke={incomeColor} strokeWidth={2} strokeLinecap="round" name="Monthly Income" dot={false} />
                    <Line type="natural" dataKey="totalExpenses" stroke={expenseColor} strokeWidth={2} strokeLinecap="round" name="Total Expenses" dot={false} />
                    <Line type="natural" dataKey="cumulative" stroke="#375DFB" strokeWidth={3} strokeLinecap="round" name="Cumulative Balance" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ExpandingChart>
            </SectionCard>
          </div>
        )}

        {activeTab === 'settings' && (
          <div key="settings" className="animate-fadein space-y-6">
            <SectionCard
              title="Income Sources"
              icon={Wallet}
              delay={0}
            >
              <div className="mb-5 flex items-center justify-between rounded-2xl bg-[#F5F2FA] px-4 py-3">
                <span className="text-sm font-medium text-[#46464F]">Estimated monthly income</span>
                <span className="text-lg font-semibold text-[#3255E4]"><Amount value={currentMonthBudget} digits={2} /></span>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <NumberField
                  label="Severance pay (total)"
                  value={income.severancePay}
                  onChange={(v) => setIncome({ ...income, severancePay: v })}
                />
                <NumberField
                  label="Severance allocated to monthly income"
                  value={income.severanceForMonthly}
                  onChange={(v) => setIncome({ ...income, severanceForMonthly: v })}
                  help={<>Spread over 12 months → <Amount value={monthlyFromSeverance} digits={2} />/mo</>}
                />
                <NumberField
                  label="Unemployment insurance (monthly)"
                  value={income.unemploymentPay}
                  onChange={(v) => setIncome({ ...income, unemploymentPay: v })}
                />
                <NumberField
                  label="Shares sold (total)"
                  value={income.sharesSold}
                  onChange={(v) => setIncome({ ...income, sharesSold: v })}
                  help="Spread evenly across the 13-month plan"
                />
                <NumberField
                  label="Freelance work (total)"
                  value={income.freelancerWork}
                  onChange={(v) => setIncome({ ...income, freelancerWork: v })}
                  help="Spread evenly across the 13-month plan"
                />
                <NumberField
                  label="Garage rent (monthly)"
                  value={income.garageRent}
                  onChange={(v) => setIncome({ ...income, garageRent: v })}
                />
                <NumberField
                  label="Flat rent (monthly)"
                  value={income.flatRent}
                  onChange={(v) => setIncome({ ...income, flatRent: v })}
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
                  <Upload className="text-[#3255E4]" size={26} />
                  <span className="text-base font-medium text-[#1B1B21]">Drop a CSV here, or click to browse</span>
                  <span className="text-xs text-[#645F6C]">Columns: Date, Amount, Category</span>
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

export default SeveranceBudgetTracker;
