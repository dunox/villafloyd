import styles from './styles/index.module.scss';

interface LogoProps {
  light?: boolean;
}

function Logo({ light = false }: LogoProps) {
  return (
    <a className={`${styles.logo} ${light ? styles.light : ''}`} href="#top" aria-label="Villa Floyd home">
      <span className={styles.name}>Villa Floyd</span>
      <span className={styles.place}>Torreblanca · Costa del Sol</span>
    </a>
  );
}

export default Logo;
