// Mock localStorage and window before importing any code
const mockLocalStorage = {
  getItem: (key: string) => {
    if (key === 'land_session') {
      return JSON.stringify({ id: '11111111-1111-1111-1111-111111111111', code: 'L001', name: 'Lahan Alpukat' });
    }
    return null;
  },
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

(globalThis as any).localStorage = mockLocalStorage;
(globalThis as any).window = {
  localStorage: mockLocalStorage
};

import { test, describe } from 'node:test';
import assert from 'node:assert';

// Import Vue stores & helpers using relative paths
import { landsList } from '../../src/store/navigation';
import { accountsList, mapApiScheduleToLocal, mapLocalScheduleToApi } from '../../src/store/operatorAdmin';
import { pohonApi } from '../../src/shared/api/perkebunan';
import apiClient from '../../src/shared/api/client';

describe('Frontend Unit Tests', () => {
  // Test mapBackendPohonToFrontend via mock API client
  test('pohonApi mapping parses age correctly and normalizes Produktif to Generatif', async () => {
    // Mock apiClient.get
    apiClient.get = async (url: string) => {
      if (url === '/api/v1/pohon') {
        return [
          {
            id_pohon: 'tree-1',
            kode_pohon: 'LA002',
            tanggal_tanam: '2024-05-17T00:00:00Z',
            varietas: 'Alpukat Aligator',
            fase_pohon: 'Vegetatif',
            Lahan_id_lahan: 'lahan-1',
            status_pohon: 'aktif'
          },
          {
            id_pohon: 'tree-2',
            kode_pohon: 'LA001',
            tanggal_tanam: '2021-05-17T00:00:00Z',
            varietas: 'Alpukat Aligator',
            fase_pohon: 'Produktif', // Should be normalized to Generatif
            Lahan_id_lahan: 'lahan-1',
            status_pohon: 'aktif'
          }
        ];
      }
      return [];
    };

    const trees = await pohonApi.getList();
    assert.strictEqual(trees.length, 2);

    // LA002 assertions
    const la002 = trees[0];
    assert.strictEqual(la002.kode_pohon, 'LA002');
    assert.strictEqual(la002.status, 'Vegetatif');
    const currentYear = new Date().getFullYear();
    assert.strictEqual(la002.umur, currentYear - 2024);

    // LA001 assertions
    const la001 = trees[1];
    assert.strictEqual(la001.kode_pohon, 'LA001');
    assert.strictEqual(la001.status, 'Generatif'); // normalized
    assert.strictEqual(la001.umur, currentYear - 2021);
  });

  // Test mapLocalScheduleToApi
  test('mapLocalScheduleToApi correctly translates frontend category/rincian to strict DB enum strings', () => {
    // Populate lists for UUID resolving
    landsList.value = [
      { id: 'lahan-1', code: 'L001', name: 'Lahan Alpukat', location: '', status: '', capacity: 0 }
    ];
    accountsList.value = [
      { id: 'op-1', username: 'operator_kebun', operator_category: 'kebun' }
    ];

    const localSched = {
      title: 'Siram Pagi',
      description: 'Siram pohon alpukat',
      category: 'penyiraman' as any,
      rincian: 'Siram Manual',
      frequency: 'harian',
      priority: 'tinggi' as any,
      cageCode: 'L001',
      assigneeCode: 'OP002',
      startDate: '2026-07-06',
      time: '08:00',
      endTime: '09:00',
      active: true
    };

    const apiPayload = mapLocalScheduleToApi(localSched);

    // Assert category and rincian are mapped to strict PostgreSQL enum values
    assert.strictEqual(apiPayload.category, 'penyiraman');
    assert.strictEqual(apiPayload.rincian, 'Penyiraman Rutin'); // Siram Manual -> Penyiraman Rutin
    assert.strictEqual(apiPayload.id_cage, 'lahan-1');
    assert.strictEqual(apiPayload.id_account, 'op-1');
  });

  // Test mapApiScheduleToLocal
  test('mapApiScheduleToLocal decodes strict DB strings back to frontend representations', () => {
    landsList.value = [
      { id: 'lahan-1', code: 'L001', name: 'Lahan Alpukat', location: '', status: '', capacity: 0 }
    ];
    accountsList.value = [
      { id: 'op-1', username: 'operator_kebun', operator_category: 'kebun' }
    ];

    const apiSched = {
      id: 'sched-1',
      title: 'Siram Pagi',
      description: 'Siram pohon alpukat',
      category: 'penyiraman' as any,
      rincian: 'Penyiraman Rutin',
      frequency: 'harian',
      priority: 'tinggi',
      id_cage: 'lahan-1',
      id_account: 'op-1',
      start_date: '2026-07-06T00:00:00Z',
      start_time: '08:00:00',
      end_time: '09:00:00',
      is_active: true
    };

    const localSched = mapApiScheduleToLocal(apiSched);

    assert.strictEqual(localSched.category, 'penyiraman');
    assert.strictEqual(localSched.rincian, 'Siram Manual'); // Penyiraman Rutin -> Siram Manual
    assert.strictEqual(localSched.cageCode, 'L001');
    assert.strictEqual(localSched.assigneeCode, 'OP002');
  });
});
