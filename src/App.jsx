import { useEffect, useState } from 'react';
import AmbientBackground from './components/AmbientBackground';
import { CurrencyProvider } from './components/CurrencyContext';
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

  // The picker has no theme toggle of its own, so it must honour the saved choice on load.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', localStorage.getItem('budgetTracker_darkMode') === 'true');
  }, []);

  let screen = <ModePicker onSelect={selectMode} />;
  if (mode === 'generic') screen = <BudgetTracker onSwitchMode={switchMode} />;
  if (mode === 'severance') screen = <SeveranceBudgetTracker onSwitchMode={switchMode} />;

  return (
    <CurrencyProvider>
      <AmbientBackground />
      {screen}
    </CurrencyProvider>
  );
};

export default App;
