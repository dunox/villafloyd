import { images } from '../../data/villa';
import Container from '../../ui/Container';
import SectionHeading from '../SectionHeading';
import styles from './styles/index.module.scss';

function Story() {
  return (
    <section className={styles.storySection}>
      <Container>
        <div className={styles.topGrid}>
          <SectionHeading
            eyebrow="The villa"
            title="Homely by design, generous by nature."
          />
          <div className={styles.copy}>
            <p className={styles.lead}>
              Villa Floyd was designed for straightforward, comfortable living: large rooms, high ceilings
              and a split-level layout that allows air and light to move naturally through the house.
            </p>
            <p>
              The lounge includes a 55-inch Smart TV with internet-provided programming,
              Sky Sports, films, children’s channels, radio, a DVD collection and more. Fibre-optic Wi-Fi
              and a LAN connection are available throughout, while air conditioning serves the lounge and
              bedrooms. A wood-burning stove makes winter stays equally inviting.
            </p>
          </div>
        </div>

        <div className={styles.featureGrid}>
          <article className={styles.feature}>
            <img src={images.kitchenMain} alt="Modern fully equipped Villa Floyd kitchen" loading="lazy" />
            <div>
              <span>Kitchen & dining</span>
              <h3>Fully equipped for long, easy lunches.</h3>
              <p>
                The modern kitchen includes an American-style fridge-freezer with filtered water and ice,
                dishwasher, washing machine, microwave, oven and ceramic hob. The adjacent dining area seats six
                and opens directly onto the level pool terrace.
              </p>
            </div>
          </article>
          <article className={`${styles.feature} ${styles.reverse}`}>
            <img src={images.twinBedroom} alt="Twin bedroom at Villa Floyd" loading="lazy" />
            <div>
              <span>Sleeping</span>
              <h3>Quiet rooms, quality linen, room for six.</h3>
              <p>
                A double bedroom and twin bedroom each include built-in wardrobes and storage. Two further
                single beds are located in the spacious entrance lounge, beside a separate shower room. There
                are no sofa beds, and all guests receive fresh linen and towels.
              </p>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}

export default Story;
