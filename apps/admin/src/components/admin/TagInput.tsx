/**
 * Dosyanın görevi: Virgulle yazma, Enter ile ekleme, yapistirma ve chip silme destekli etiket alanini sunar.
 * Kullanıldığı yerler: app/dashboard/posts/new/page.tsx, app/dashboard/posts/[id]/edit/page.tsx, tests/components.test.tsx
 */
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value?: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

/** Virgulle yazma, Enter ile ekleme, yapistirma ve chip silme destekli etiket alanini sunar. */
export default function TagInput({ value = [], onChange, error }: TagInputProps) {
  const [draft, setDraft] = useState('');

  /** Girilen metni temiz etiketlere boler, tekrar etmeyen degerleri forma ekler. */
  const commitTags = (rawValue: string) => {
    const candidates = rawValue
      .split(',')
      .map((tag) => tag.trim().replace(/^#+/, ''))
      .filter(Boolean);
    if (candidates.length === 0) return;

    const seen = new Set(value.map((tag) => tag.toLocaleLowerCase('tr-TR')));
    const additions = candidates.filter((tag) => {
      const key = tag.toLocaleLowerCase('tr-TR');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (additions.length > 0) onChange([...value, ...additions]);
    setDraft('');
  };

  /** Klavye ayiricilarini etikete cevirir ve bos alanda son etiketi geri alir. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitTags(draft);
      return;
    }
    if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  /** Virgul iceren yapistirilmis bir listeyi tek adimda ayri etiketlere donusturur. */
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text');
    if (!pasted.includes(',')) return;
    event.preventDefault();
    commitTags(`${draft}${pasted}`);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="tags" className="block font-display font-bold text-sm text-brand-dark">
        Etiketler
      </label>
      <div className={`min-h-12 flex flex-wrap items-center gap-2 px-3 py-2 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-emerald-500 ${error ? 'border-red-500' : 'border-neutral-300'}`}>
        {value.map((tag) => (
          <span key={tag.toLocaleLowerCase('tr-TR')} className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded text-sm">
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="text-emerald-700 hover:text-red-600"
              aria-label={`${tag} etiketini kaldir`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <input
          id="tags"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => commitTags(draft)}
          className="min-w-40 flex-1 border-0 outline-none bg-transparent px-1 py-1 text-sm"
          placeholder={value.length === 0 ? 'toprak, sulama, verimlilik' : 'Etiket ekle'}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-xs text-brand-gray">Virgul veya Enter ile birden fazla etiket ekleyin.</p>
    </div>
  );
}
