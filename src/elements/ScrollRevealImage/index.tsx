import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import styles from './styles/index.module.scss';

interface ScrollRevealImageProps {
  src: string;
  alt: string;
  variant: 'portrait' | 'coast';
  loading?: 'eager' | 'lazy';
}

function ScrollRevealImage({
  src,
  alt,
  variant,
  loading = 'lazy',
  children,
}: PropsWithChildren<ScrollRevealImageProps>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || !('IntersectionObserver' in window)) {
      setRevealed(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setRevealed(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${styles.scrollRevealImage} ${styles[variant]} ${revealed ? styles.revealed : ''}`}
    >
      <div className={styles.imageFrame}>
        <img src={src} alt={alt} loading={loading} />
      </div>
      {children}
    </div>
  );
}

export default ScrollRevealImage;
