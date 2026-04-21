import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { canViewFossilCode } from '../../utils/fossilCodeVisibility.js';
import './FossilCodeCopy.css';

/**
 * Muestra el código del ejemplar y un botón para copiarlo (solo si el usuario puede verlo).
 *
 * @param {{ code?: string | null, variant?: 'detail' | 'card' | 'map', className?: string }} props
 */
export default function FossilCodeCopy({ code, variant = 'detail', className = '' }) {
  const { user } = useAuth();

  if (!canViewFossilCode(user) || !code || String(code).trim() === '') {
    return null;
  }

  const handleCopy = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(String(code).trim());
      toast.success('Código copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <span className={`fossil-code-copy fossil-code-copy--${variant} ${className}`.trim()}>
      <span className="fossil-code-copy__value">{code}</span>
      <button
        type="button"
        className="fossil-code-copy__btn"
        onClick={handleCopy}
        aria-label={`Copiar código ${code}`}
      >
        Copiar
      </button>
    </span>
  );
}
