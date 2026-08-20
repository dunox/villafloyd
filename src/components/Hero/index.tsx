import { images } from '../../data/villa';
import Container from '../../ui/Container';
import Icon from '../../ui/Icon';
import Tag from '../../ui/Tag';
import BookingPanel from '../BookingPanel';
import styles from './styles/index.module.scss';

function Hero() {
  return (
    <section id="top" className={styles.heroSection} style={{ backgroundImage: `url(${images.hero})` }}>
      <div className={styles.overlay} />
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <Tag>Private villa · Costa del Sol</Tag>
          <h1>A slower rhythm,<br />above the sea.</h1>
          <p>
            Villa Floyd is a spacious private retreat in Torreblanca, with uninterrupted sea views,
            a secluded pool terrace and room for up to six guests.
          </p>
          <a className={styles.explore} href="#villa">
            Explore the villa <Icon name="arrow" size={17} />
          </a>
        </div>
        <div className={styles.booking}>
          <BookingPanel />
        </div>
      </Container>
      <div className={styles.caption}>Torreblanca · Fuengirola · Málaga</div>
    </section>
  );
}

export default Hero;
