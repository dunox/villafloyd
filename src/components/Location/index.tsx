import { images } from '../../data/villa';
import ScrollRevealImage from '../../elements/ScrollRevealImage';
import Container from '../../ui/Container';
import Icon from '../../ui/Icon';
import SectionHeading from '../SectionHeading';
import styles from './styles/index.module.scss';

const places = [
  { icon: 'train' as const, value: 'A few minutes', label: 'Torreblanca train station' },
  { icon: 'plane' as const, value: 'Around 30 min', label: 'Direct train to Málaga Airport' },
  { icon: 'walk' as const, value: 'A short walk', label: 'Beachfront bars and restaurants' },
  { icon: 'pin' as const, value: 'Nearby', label: 'Two well-stocked supermarkets' },
];

function Location() {
  return (
    <section className={styles.locationSection} id="location">
      <Container>
        <div className={styles.grid}>
          <div className={styles.content}>
            <SectionHeading
              eyebrow="Torreblanca, near Fuengirola."
              title="Peaceful above the coast, connected to everything."
              body="Torreblanca is an established residential neighbourhood east of central Fuengirola. The beach, restaurants and everyday essentials are close by, while the local train makes the wider coast easy to explore without a car."
            />
            <div className={styles.places}>
              {places.map((place) => (
                <div className={styles.place} key={place.label}>
                  <span><Icon name={place.icon} size={20} /></span>
                  <div><strong>{place.value}</strong><small>{place.label}</small></div>
                </div>
              ))}
            </div>
          </div>
          <ScrollRevealImage
            src={images.coast}
            alt="Mediterranean coastline near Fuengirola"
            variant="coast"
          >
            <div className={styles.mapCard}>
              <span className={styles.pin}><Icon name="villa" size={22} /></span>
              <div>
                <small>Stay here</small>
                <strong>Villa Floyd</strong>
                <p>Torreblanca, near Fuengirola.</p>
              </div>
            </div>
          </ScrollRevealImage>
        </div>
      </Container>
    </section>
  );
}

export default Location;
