import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './styles/index.module.scss';

interface BaseProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement> & { multiline?: false };
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

function Input(props: InputProps | TextareaProps) {
  const { label, hint, error, className = '', multiline, ...fieldProps } = props;
  const generatedId = useId();
  const fieldId = String(fieldProps.id ?? fieldProps.name ?? generatedId);
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [fieldProps['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;

  const accessibilityProps = {
    id: fieldId,
    'aria-invalid': error ? true : fieldProps['aria-invalid'],
    'aria-describedby': describedBy,
  };

  return (
    <label className={`${styles.field} ${className}`} htmlFor={fieldId} data-invalid={error ? 'true' : undefined}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          {...(fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          {...accessibilityProps}
        />
      ) : (
        <input
          {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)}
          {...accessibilityProps}
        />
      )}
      {hint ? <small id={hintId}>{hint}</small> : null}
      {error ? <small id={errorId} className={styles.error} role="alert">{error}</small> : null}
    </label>
  );
}

export default Input;
