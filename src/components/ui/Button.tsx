import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'light' | 'ghost';
type Size = 'md' | 'lg';

const base =
  'group inline-flex items-center justify-center gap-2 rounded-full font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-amber-500 text-white shadow-[0_10px_30px_-10px_rgba(245,124,31,0.7)] hover:bg-amber-600',
  secondary: 'border border-navy-900/15 bg-white/90 text-navy-900 hover:border-navy-900/40 hover:bg-white',
  light: 'border border-white/25 bg-white/5 text-white hover:border-white/60 hover:bg-white/10',
  ghost: 'text-navy-800 hover:text-amber-600',
};

const sizes: Record<Size, string> = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'lg', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

export function Button({ variant = 'primary', size = 'lg', icon, className = '', children, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {icon && <span className="transition-transform duration-200 group-hover:translate-x-0.5">{icon}</span>}
    </button>
  );
}
