import { useState } from 'react';
import { reviews } from '../../data/villa';
import Container from '../../ui/Container';
import Icon from '../../ui/Icon';
import SectionHeading from '../SectionHeading';
import styles from './styles/index.module.scss';

function Reviews() {
  const [active, setActive] = useState(0);
  const review = reviews[active];

  const move = (direction: number) => {
    setActive((current) => (current + direction + reviews.length) % reviews.length);
  };

  return (
    <section className={styles.reviewsSection}>
      <Container>
        <div className={styles.header}>
          <SectionHeading eyebrow="Guest notes" title="The kind of stay people remember." light />
          <div className={styles.controls}>
            <button type="button" onClick={() => move(-1)} aria-label="Previous review">
              <Icon name="chevronLeft" />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Next review">
              <Icon name="chevronRight" />
            </button>
          </div>
        </div>
        <article className={styles.card} key={review.author}>
          <span className={styles.quoteMark}>“</span>
          <blockquote>{review.quote}</blockquote>
          <footer>
            <strong>{review.author}</strong>
            <span>{review.stay}</span>
          </footer>
        </article>
        <div className={styles.dots}>
          {reviews.map((item, index) => (
            <button
              type="button"
              key={item.author}
              className={index === active ? styles.dotActive : ''}
              aria-label={`Show review ${index + 1}`}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default Reviews;
