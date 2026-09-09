import { useState } from 'react';
import ModePicker from './components/ModePicker';
import BudgetTracker from './BudgetTracker';
import SeveranceBudgetTracker from './SeveranceBudgetTracker';

// Persisted like every other piece of state in this app, so returning
// visitors land straight back in their mode instead of re-picking every time.
// "Switch mode" (in the header) just calls setMode(null) to show the picker again.
const App = () => {
  const [mode, setMode] = useState(() => localStorage.getItem('budgetTracker_activeMode') || null);

  const selectMode = (nextMode) => {
    localStorage.setItem('budgetTracker_activeMode', nextMode);
    setMode(nextMode);
  };

  const switchMode = () => setMode(null);

  if (mode === 'generic') return <BudgetTracker onSwitchMode={switchMode} />;
  if (mode === 'severance') return <SeveranceBudgetTracker onSwitchMode={switchMode} />;
  return <ModePicker onSelect={selectMode} />;
};

export default App;
