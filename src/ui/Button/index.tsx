import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import Icon from '../Icon';
import styles from './styles/index.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'light';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  withArrow?: boolean;
}

function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  withArrow = false,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${
        fullWidth ? styles.fullWidth : ''
      } ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {withArrow ? <Icon name="arrow" size={17} /> : null}
    </button>
  );
}

export default Button;
