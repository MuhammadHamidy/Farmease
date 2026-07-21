import { describe, it, expect } from 'vitest';

interface Sheep {
  sheep_code: string;
  sheep_name: string;
  status: string;
}

// Fungsi filter pencarian yang merepresentasikan logika pencarian di frontend Farmease
function filterSheepList(list: Sheep[], query: string): Sheep[] {
  const q = query.toLowerCase().trim();
  if (!q) return list;
  return list.filter(s => 
    s.sheep_code.toLowerCase().includes(q) ||
    s.sheep_name.toLowerCase().includes(q) ||
    s.status.toLowerCase().includes(q)
  );
}

describe('Sheep List Search Filter Logic', () => {
  const mockSheep: Sheep[] = [
    { sheep_code: 'DM-001', sheep_name: 'Garut Super', status: 'Sehat' },
    { sheep_code: 'DM-002', sheep_name: 'Texel Indah', status: 'Sakit' },
    { sheep_code: 'DM-003', sheep_name: 'Dorper Gemuk', status: 'Sehat' }
  ];

  it('returns all sheep if query is empty', () => {
    const result = filterSheepList(mockSheep, '');
    expect(result).toHaveLength(3);
  });

  it('filters sheep by name (case-insensitive)', () => {
    const result = filterSheepList(mockSheep, 'super');
    expect(result).toHaveLength(1);
    expect(result[0].sheep_code).toBe('DM-001');
  });

  it('filters sheep by code', () => {
    const result = filterSheepList(mockSheep, 'DM-002');
    expect(result).toHaveLength(1);
    expect(result[0].sheep_name).toBe('Texel Indah');
  });

  it('filters sheep by status', () => {
    const result = filterSheepList(mockSheep, 'Sehat');
    expect(result).toHaveLength(2); // DM-001 dan DM-003
  });
});
