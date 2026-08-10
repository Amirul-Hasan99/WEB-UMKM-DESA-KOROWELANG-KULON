import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SoftInput from '../components/SoftInput';

describe('SoftInput Component', () => {
  it('renders input with label and placeholder', () => {
    render(<SoftInput label="Nama Lengkap" placeholder="Masukkan nama Anda" />);
    
    expect(screen.getByText(/nama lengkap/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/masukkan nama anda/i)).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    const handleChange = vi.fn();
    render(<SoftInput placeholder="Email" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText(/email/i);
    fireEvent.change(input, { target: { value: 'warga@gmail.com' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('warga@gmail.com');
  });

  it('renders validation error message when error prop is provided', () => {
    render(<SoftInput label="Email" error="Format email tidak valid" />);
    
    expect(screen.getByText(/format email tidak valid/i)).toBeInTheDocument();
  });
});
