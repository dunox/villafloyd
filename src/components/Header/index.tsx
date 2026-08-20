import { useEffect, useState } from 'react';
import Button from '../../ui/Button';
import Container from '../../ui/Container';
import Icon from '../../ui/Icon';
import Logo from '../../ui/Logo';
import styles from './styles/index.module.scss';

const navItems = [
  ['The villa', '#villa'],
  ['Gallery', '#gallery'],
  ['Amenities', '#amenities'],
  ['Location', '#location'],
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 70);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${solid || menuOpen ? styles.solid : ''}`}>
      <Container className={styles.inner}>
        <Logo light={!solid && !menuOpen} />
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`} aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <Button className={styles.mobileCta} size="sm" onClick={() => document.querySelector('#book')?.scrollIntoView()}>
            Book your stay
          </Button>
        </nav>
        <div className={styles.actions}>
          <Button
            className={styles.desktopCta}
            variant={solid ? 'primary' : 'light'}
            size="sm"
            onClick={() => document.querySelector('#book')?.scrollIntoView()}
          >
            Check availability
          </Button>
          <button
            className={styles.menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </Container>
    </header>
  );
}

export default Header;
