import { highlights } from '../../data/villa';
import Container from '../../ui/Container';
import styles from './styles/index.module.scss';

function Highlights() {
  return (
    <section className={styles.highlightsSection}>
      <Container className={styles.grid}>
        <div className={styles.intro}>
          <span>At a glance</span>
          <p>Everything you need for an unhurried stay on the Costa del Sol.</p>
        </div>
        {highlights.map((item) => (
          <div className={styles.stat} key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </Container>
    </section>
  );
}

export default Highlights;
