import {ChevronDown} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

export type FilterOption<T extends string> = {value: T; label: string};

export function MultiSelectFilter<T extends string>({label, allLabel, options, values, onChange}: {
  label: string;
  allLabel: string;
  options: FilterOption<T>[];
  values: T[];
  onChange: (values: T[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  const summary = values.length === 0 ? allLabel : values.length === 1
    ? options.find(option => option.value === values[0])?.label ?? label
    : `${values.length} selected`;

  function toggle(value: T) {
    onChange(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  }

  return <div className="multi-filter" ref={root}>
    <button type="button" className="multi-filter-trigger" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(current => !current)}>
      <span><small>{label}</small><b>{summary}</b></span>
      <ChevronDown aria-hidden="true"/>
    </button>
    {open && <div className="multi-filter-menu" role="group" aria-label={label}>
      <label className="multi-filter-all">
        <input type="checkbox" checked={values.length === 0} onChange={() => onChange([])}/>
        <span>{allLabel}</span>
      </label>
      {options.map(option => <label key={option.value}>
        <input type="checkbox" checked={values.includes(option.value)} onChange={() => toggle(option.value)}/>
        <span>{option.label}</span>
      </label>)}
    </div>}
  </div>;
}
