import Container from '../../ui/Container';
import Logo from '../../ui/Logo';
import styles from './styles/index.module.scss';

const navItems = [
  ['The villa', '#villa'],
  ['Gallery', '#gallery'],
  ['Amenities', '#amenities'],
  ['Location', '#location'],
  ['Availability', '#book'],
];

function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo light />
            <p>Private sea-view villa in Torreblanca, near Fuengirola.</p>
          </div>
          <div>
            <span className={styles.label}>Explore</span>
            <nav className={styles.links} aria-label="Footer navigation">
              {navItems.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
            </nav>
          </div>
          <div>
            <span className={styles.label}>Enquiries</span>
            <div className={styles.links}>
              <a href="mailto:stay@villafloyd.com">stay@villafloyd.com</a>
              <a href="tel:+34000000000">+34 000 000 000</a>
              <span>Torreblanca, near Fuengirola.</span>
            </div>
          </div>
          <div>
            <span className={styles.label}>Stay in the loop</span>
            <p className={styles.small}>Occasional availability and seasonal updates.</p>
            <form className={styles.newsletter} onSubmit={(event) => event.preventDefault()}>
              <input type="email" aria-label="Email address" placeholder="Your email" />
              <button type="submit" aria-label="Subscribe">→</button>
            </form>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Villa Floyd</span>
          <span>Privacy · Terms · Booking conditions</span>
          <span>Website concept for Villa Floyd</span>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
