import { Delete } from 'lucide-react';

interface NumberPadProps {
  onDigit: (d: string) => void;
  onClear: () => void;
  onEnter: () => void;
  disabled: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function NumberPad({ onDigit, onClear, onEnter, disabled }: NumberPadProps) {
  const baseBtn =
    'h-16 rounded-2xl font-display font-bold text-2xl flex items-center justify-center transition-all duration-150 no-select ' +
    'shadow-md active:scale-95 active:shadow-sm disabled:opacity-40';

  return (
    <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs mx-auto">
      {KEYS.map((k) => (
        <button
          key={k}
          className={`${baseBtn} bg-white text-sky-700 hover:bg-sky-50 border-2 border-sky-100`}
          onClick={() => onDigit(k)}
          disabled={disabled}
        >
          {k}
        </button>
      ))}
      <button
        className={`${baseBtn} bg-coral-100 text-coral-600 hover:bg-coral-200 border-2 border-coral-200`}
        onClick={onClear}
        disabled={disabled}
      >
        <Delete className="w-7 h-7" />
      </button>
      <button
        className={`${baseBtn} bg-white text-sky-700 hover:bg-sky-50 border-2 border-sky-100`}
        onClick={() => onDigit('0')}
        disabled={disabled}
      >
        0
      </button>
      <button
        className={`${baseBtn} bg-mint-400 text-white hover:bg-mint-500 border-2 border-mint-500`}
        onClick={onEnter}
        disabled={disabled}
      >
        ✓
      </button>
    </div>
  );
}
