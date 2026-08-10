import { describe, it, expect } from 'vitest';
import { initialDynamicContent, initialUmkms } from '../lib/api';

describe('Frontend API Data & Helpers', () => {
  it('initialDynamicContent should contain valid site metadata', () => {
    expect(initialDynamicContent).toHaveProperty('siteName');
    expect(initialDynamicContent).toHaveProperty('heroTitle');
    expect(initialDynamicContent.siteName).toBe('UMKM Korowelang Kulon');
  });

  it('initialUmkms should contain list of village UMKMs with valid products', () => {
    expect(Array.isArray(initialUmkms)).toBe(true);
    expect(initialUmkms.length).toBeGreaterThan(0);
    
    const firstUmkm = initialUmkms[0];
    expect(firstUmkm).toHaveProperty('name');
    expect(firstUmkm).toHaveProperty('owner');
    expect(Array.isArray(firstUmkm.products)).toBe(true);
  });
});
