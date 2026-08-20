import styles from './styles/index.module.scss';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  body?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

function SectionHeading({ eyebrow, title, body, align = 'left', light = false }: SectionHeadingProps) {
  return (
    <div className={`${styles.heading} ${styles[align]} ${light ? styles.light : ''}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export default SectionHeading;
