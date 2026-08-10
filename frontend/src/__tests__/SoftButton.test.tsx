import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SoftButton from '../components/SoftButton';

describe('SoftButton Component', () => {
  it('renders button with children text', () => {
    render(<SoftButton>Klik Saya</SoftButton>);
    expect(screen.getByRole('button', { name: /klik saya/i })).toBeInTheDocument();
  });

  it('handles click events properly', () => {
    const handleClick = vi.fn();
    render(<SoftButton onClick={handleClick}>Simpan</SoftButton>);
    
    const button = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant classes correctly', () => {
    render(<SoftButton variant="primary">Tombol Utama</SoftButton>);
    const button = screen.getByRole('button', { name: /tombol utama/i });
    expect(button.className).toContain('soft-button-primary');
  });

  it('renders disabled state correctly', () => {
    render(<SoftButton disabled>Disabled Button</SoftButton>);
    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
  });
});
