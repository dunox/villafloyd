import type { PropsWithChildren } from 'react';
import styles from './styles/index.module.scss';

function Tag({ children }: PropsWithChildren) {
  return <span className={styles.tag}>{children}</span>;
}

export default Tag;
