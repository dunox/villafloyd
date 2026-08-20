import type { HTMLAttributes, PropsWithChildren } from 'react';
import styles from './styles/index.module.scss';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  narrow?: boolean;
}

function Container({ children, className = '', narrow = false, ...props }: PropsWithChildren<ContainerProps>) {
  return (
    <div
      className={`${styles.container} ${narrow ? styles.narrow : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export default Container;
