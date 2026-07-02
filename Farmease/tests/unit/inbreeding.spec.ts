import { describe, it, expect } from 'vitest';

interface Sheep {
  id: string;
  code: string;
  gender: 'jantan' | 'betina';
  status: string;
}

// Logika pembantu untuk memvalidasi pasangan perkawinan sebelum cek inbreeding
function validateBreedingPair(male: Sheep | null, female: Sheep | null): { valid: boolean; reason?: string } {
  if (!male || !female) {
    return { valid: false, reason: 'Pejantan dan betina harus dipilih' };
  }
  if (male.id === female.id) {
    return { valid: false, reason: 'ID domba tidak boleh sama' };
  }
  if (male.gender !== 'jantan') {
    return { valid: false, reason: 'Pejantan harus berjenis kelamin jantan' };
  }
  if (female.gender !== 'betina') {
    return { valid: false, reason: 'Betina harus berjenis kelamin betina' };
  }
  if (['Mati', 'Terjual', 'Disembelih'].includes(male.status) || ['Mati', 'Terjual', 'Disembelih'].includes(female.status)) {
    return { valid: false, reason: 'Domba harus berstatus aktif/sehat' };
  }
  return { valid: true };
}

describe('Breeding Pair Preflight Check', () => {
  const maleSheep: Sheep = { id: 'm1', code: 'DM01', gender: 'jantan', status: 'Sehat' };
  const femaleSheep: Sheep = { id: 'f1', code: 'DM02', gender: 'betina', status: 'Sehat' };

  it('passes validation for a valid male and female pair', () => {
    const result = validateBreedingPair(maleSheep, femaleSheep);
    expect(result.valid).toBe(true);
  });

  it('fails if male and female are the exact same sheep', () => {
    const result = validateBreedingPair(maleSheep, maleSheep as any);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('ID domba tidak boleh sama');
  });

  it('fails if male sheep is of gender betina', () => {
    const wrongMale = { ...maleSheep, gender: 'betina' as const };
    const result = validateBreedingPair(wrongMale, femaleSheep);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Pejantan harus berjenis kelamin jantan');
  });

  it('fails if female sheep is of gender jantan', () => {
    const wrongFemale = { ...femaleSheep, gender: 'jantan' as const };
    const result = validateBreedingPair(maleSheep, wrongFemale);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Betina harus berjenis kelamin betina');
  });

  it('fails if any sheep in pair has inactive status (e.g. Mati)', () => {
    const deadFemale = { ...femaleSheep, status: 'Mati' };
    const result = validateBreedingPair(maleSheep, deadFemale);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Domba harus berstatus aktif/sehat');
  });
});
