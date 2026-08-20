import { useEffect, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon';
import styles from './styles/index.module.scss';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}

function Modal({
  open,
  title,
  description = 'Share a few details about your stay and we will confirm availability personally.',
  onClose,
  children,
}: PropsWithChildren<ModalProps>) {
  useEffect(() => {
    if (!open) return;

    document.body.classList.add('modal-open');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <div
        aria-modal="true"
        className={styles.modal}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <div className={styles.kicker}>
              <span className={styles.mark}><Icon name="sparkle" size={15} /></span>
              <span>Villa Floyd · direct booking</span>
            </div>
            <h2 id="modal-title">{title}</h2>
            <p id="modal-description">{description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
