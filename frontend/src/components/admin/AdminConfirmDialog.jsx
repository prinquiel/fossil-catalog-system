import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Diálogo modal de confirmación (sustituto de window.confirm) con estilo admin.
 *
 * @param {{
 *   open: boolean;
 *   title: string;
 *   children: import('react').ReactNode;
 *   confirmLabel?: string;
 *   cancelLabel?: string;
 *   confirmVariant?: 'primary' | 'danger';
 *   loading?: boolean;
 *   onConfirm: () => void;
 *   onCancel: () => void;
 * }} props
 */
export default function AdminConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmBtnClass =
    confirmVariant === 'danger' ? 'admin-btn admin-btn--danger' : 'admin-btn admin-btn--primary';
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel]);

  if (typeof document === 'undefined' || !open) return null;

  return createPortal(
    <div
      className="admin-confirm-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        className="admin-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-dialog-title"
        aria-describedby="admin-confirm-dialog-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-confirm-dialog-title" className="admin-confirm-dialog__title">
          {title}
        </h2>
        <div id="admin-confirm-dialog-desc" className="admin-confirm-dialog__body">
          {children}
        </div>
        <div className="admin-confirm-dialog__actions">
          <button type="button" className="admin-btn admin-btn--ghost" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmBtnClass} disabled={loading} onClick={onConfirm}>
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
