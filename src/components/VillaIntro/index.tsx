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
              <span>Sunrise to sunset<br />with extensive sea views</span>
            </div>
          </ScrollRevealImage>
          <div className={styles.content}>
            <SectionHeading
              eyebrow="Welcome to Villa Floyd"
              title="Space to breathe. Views worth staying in for."
              body="Villa Floyd is an established private villa located in Torreblanca, an established residential area on the edge of Fuengirola. The owner has lived in the villa for over 20 years and the property is equipped and furnished and provided with all facilities that you would expect."
            />
            <div className={styles.details}>
              <p>
                The pool terrace is a private sun trap with an 8 × 4 metre pool, shaded lounging areas
                and broad views across the Mediterranean. From here, watch the coast wake at sunrise
                and watch the sun setting over the mountains.
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
