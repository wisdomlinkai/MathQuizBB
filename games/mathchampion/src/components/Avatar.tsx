import { AVATARS } from '@/game';

interface AvatarPickerProps {
  selected: string;
  onSelect: (id: string) => void;
  size?: 'sm' | 'lg';
}

export function AvatarPicker({ selected, onSelect, size = 'lg' }: AvatarPickerProps) {
  const sizeClass =
    size === 'lg'
      ? 'w-16 h-16 text-4xl'
      : 'w-12 h-12 text-3xl';

  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.id)}
          className={`${sizeClass} rounded-2xl flex items-center justify-center transition-all duration-200 no-select ${
            selected === avatar.id
              ? 'bg-sky-400 ring-4 ring-sky-300 scale-110 shadow-lg'
              : 'bg-white/70 hover:bg-white ring-2 ring-sky-100'
          }`}
        >
          {avatar.emoji}
        </button>
      ))}
    </div>
  );
}

export function AvatarDisplay({ avatar, size = 'md' }: { avatar: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const found = AVATARS.find((a) => a.id === avatar) ?? AVATARS[0];
  const sizeClass = {
    sm: 'w-10 h-10 text-2xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-20 h-20 text-5xl',
    xl: 'w-28 h-28 text-6xl',
  }[size];

  return (
    <div className={`${sizeClass} rounded-full bg-white/80 flex items-center justify-center shadow-md shrink-0`}>
      {found.emoji}
    </div>
  );
}
