import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext.jsx';
import SiteHeader from './SiteHeader.jsx';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('SiteHeader', () => {
  it('renders primary navigation links', () => {
    renderWithRouter(
      <AuthProvider>
        <SiteHeader />
      </AuthProvider>
    );
    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^estudios$/i })).toHaveAttribute('href', '/catalog/estudios');
    expect(screen.getByRole('link', { name: /catálogo/i })).toBeInTheDocument();
  });
});
