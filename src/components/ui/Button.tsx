import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

type RouterLinkProps = CommonProps & { to: LinkProps['to'] } & Omit<LinkProps, 'to' | 'className' | 'children'>;
type AnchorProps = CommonProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'className' | 'children'
  >;
type NativeButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export type ButtonProps = RouterLinkProps | AnchorProps | NativeButtonProps;

const base =
  'group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out-soft ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-accent-solid text-on-accent shadow-sm hover:bg-accent-solid-hover',
  secondary: 'border border-line-strong bg-surface text-fg hover:border-accent/60 hover:text-accent',
  ghost: 'text-fg-muted hover:text-accent hover:bg-accent-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[0.95rem]',
};

function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button(props: ButtonProps) {
  const { variant, size, className, children, leadingIcon, trailingIcon, ...rest } = props;
  const classes = buttonClasses(variant, size, className);
  const content = (
    <>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </>
  );

  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link {...(rest as Omit<RouterLinkProps, keyof CommonProps>)} className={classes}>
        {content}
      </Link>
    );
  }

  if ('href' in rest && rest.href !== undefined) {
    const anchor = rest as Omit<AnchorProps, keyof CommonProps>;
    const external = /^https?:\/\//.test(anchor.href);
    return (
      <a
        {...anchor}
        className={classes}
        {...(external && !anchor.target ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }

  const button = rest as Omit<NativeButtonProps, keyof CommonProps>;
  return (
    <button type="button" {...button} className={classes}>
      {content}
    </button>
  );
}
