import { images } from '../../data/villa';
import ScrollRevealImage from '../../elements/ScrollRevealImage';
import Container from '../../ui/Container';
import SectionHeading from '../SectionHeading';
import styles from './styles/index.module.scss';

function VillaIntro() {
  return (
    <section className={styles.villaIntroSection} id="villa">
      <Container>
        <div className={styles.grid}>
          <ScrollRevealImage
            src={images.poolSunset}
            alt="Private villa pool facing the Mediterranean"
            variant="portrait"
            loading="eager"
          >
            <div className={styles.imageNote}>
              <span>Sunrise to sunset<br />without being overlooked</span>
            </div>
          </ScrollRevealImage>
          <div className={styles.content}>
            <SectionHeading
              eyebrow="Welcome to Villa Floyd"
              title="Space to breathe. Views worth staying in for."
              body="A detached, privately owned villa set in its own gardens above Torreblanca. Designed on split levels with high ceilings and generous rooms, it remains airy and comfortable through the warmest months."
            />
            <div className={styles.details}>
              <p>
                The pool terrace is a private sun trap with an 8 × 4 metre pool, a six-seat hot tub,
                shaded lounging areas and broad views across the Mediterranean. From here, watch the
                coast wake at sunrise and the lights of Málaga appear after dark.
              </p>
              <p>
                Inside, the villa feels relaxed rather than formal: comfortably furnished, fully equipped
                and made for easy days between the kitchen, dining area, lounge and terrace.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default VillaIntro;
