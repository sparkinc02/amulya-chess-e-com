import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  value: string;
  onChange: (value: string) => void;
  shake?: boolean;
}

export default function OTPInput({ value, onChange, shake }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const handleChange = useCallback((index: number, char: string) => {
    if (char && !/^\d$/.test(char)) return;
    const arr = digits.slice();
    arr[index] = char;
    const newVal = arr.join('').replace(/[^\d]/g, '');
    onChange(newVal);
    if (char && index < 5) {
      refs.current[index + 1]?.focus();
    }
  }, [digits, onChange]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  }, [onChange]);

  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="flex justify-center gap-3"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          autoFocus={i === 0}
          className="w-[52px] h-[60px] text-center font-heading text-2xl border-[1.5px] border-border bg-card text-foreground focus:border-primary focus:shadow-[0_0_0_3px_rgba(212,168,67,0.1)] focus:outline-none transition-all"
        />
      ))}
    </motion.div>
  );
}
