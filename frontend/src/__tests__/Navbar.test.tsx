import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../components/Navbar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock api call
vi.mock('../lib/api', () => ({
  fetchDynamicContent: vi.fn().mockResolvedValue({
    siteName: 'UMKM Korowelang Kulon',
  }),
}));

describe('Navbar Component', () => {
  it('renders navigation brand name and menu links', async () => {
    render(<Navbar />);

    expect(await screen.findByText(/umkm korowelang kulon/i)).toBeInTheDocument();
    expect(screen.getByText(/beranda/i)).toBeInTheDocument();
    expect(screen.getByText(/daftar umkm/i)).toBeInTheDocument();
    expect(screen.getByText(/tentang desa/i)).toBeInTheDocument();
    expect(screen.getByText(/feedback/i)).toBeInTheDocument();
  });
});
