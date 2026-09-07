import { images } from '../../data/villa';
import Button from '../../ui/Button';
import Container from '../../ui/Container';
import styles from './styles/index.module.scss';

function BookingCta() {
  return (
    <section className={styles.bookingCtaSection} style={{ backgroundImage: `url(${images.poolSunset})` }}>
      <div className={styles.overlay} />
      <Container className={styles.content}>
        <h2>Wake to the sea.<br />Stay for the sunset.</h2>
        <p>
          Choose your dates, send a request and we will confirm availability personally.
        </p>
        <Button variant="light" size="lg" withArrow onClick={() => document.querySelector('#book')?.scrollIntoView({ behavior: 'smooth' })}>
          Check available dates
        </Button>
      </Container>
    </section>
  );
}

export default BookingCta;
