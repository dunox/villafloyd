import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { amenities } from '../../data/villa';
import Container from '../../ui/Container';
import SectionHeading from '../SectionHeading';
import styles from './styles/index.module.scss';

function Amenities() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;

    if (!section || !grid) return undefined;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>(`[data-amenity-card]`));
    const desktopQuery = window.matchMedia('(min-width: 621px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | null = null;
    let animations: Animation[] = [];

    const reset = () => {
      observer?.disconnect();
      observer = null;
      animations.forEach((animation) => animation.cancel());
      animations = [];
      cards.forEach((card) => {
        card.style.removeProperty('opacity');
        card.style.removeProperty('transform');
      });
    };

    const playOnce = (animation: Animation) => {
      animation.play();
      animation.finished
        .then(() => animation.cancel())
        .catch(() => undefined);
    };

    const setup = () => {
      reset();

      // Mobile uses native CSS sticky stacking, so avoid transform-based animations there.
      if (!desktopQuery.matches || reducedMotionQuery.matches || !('IntersectionObserver' in window)) {
        return;
      }

      animations = cards.map((card, index) => {
        const animation = card.animate(
          [
            { opacity: 0, transform: 'translate3d(0, 32px, 0) scale(0.985)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
          ],
          {
            duration: 700,
            delay: index * 100,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
            fill: 'both',
          },
        );

        animation.pause();
        return animation;
      });

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          animations.forEach(playOnce);
          observer?.disconnect();
        },
        { rootMargin: '0px 0px -28% 0px', threshold: 0 },
      );

      observer.observe(section);
    };

    setup();
    desktopQuery.addEventListener('change', setup);
    reducedMotionQuery.addEventListener('change', setup);

    return () => {
      desktopQuery.removeEventListener('change', setup);
      reducedMotionQuery.removeEventListener('change', setup);
      reset();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.amenitiesSection} id="amenities">
      <Container>
        <SectionHeading
          eyebrow="Everything included"
          title="Comfort, without complication."
          body="Villa Floyd is equipped for relaxed self-catering stays, from fresh linen and fast Wi-Fi to a full entertainment system and a modern kitchen."
          align="center"
          light
        />
        <div ref={gridRef} className={styles.grid}>
          {amenities.map((amenity, index) => (
            <article
              className={styles.card}
              data-amenity-card
              key={amenity.title}
              style={{ '--stack-index': index } as CSSProperties}
            >
              <div className={styles.image}>
                <img src={amenity.image} alt={amenity.imageAlt} loading="lazy" />
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <div className={styles.content}>
                <h3>{amenity.title}</h3>
                <p>{amenity.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Amenities;
