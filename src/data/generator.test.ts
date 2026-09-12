import { describe, it, expect, vi } from 'vitest';
import { generateInitialDataset, simulateTick, DatasetSizes, determineServerStatus } from './generator';

describe('generator', () => {
  describe('determineServerStatus', () => {
    it('returns critical for CPU or Memory > 90', () => {
      expect(determineServerStatus(95, 50)).toBe('critical');
      expect(determineServerStatus(50, 95)).toBe('critical');
    });

    it('returns warning for CPU > 75 or Memory > 80', () => {
      expect(determineServerStatus(80, 50)).toBe('warning');
      expect(determineServerStatus(50, 85)).toBe('warning');
    });

    it('returns healthy for normal ranges', () => {
      expect(determineServerStatus(50, 50)).toBe('healthy');
    });
  });

  describe('generateInitialDataset', () => {
    it('generates the correct number of servers', () => {
      const data = generateInitialDataset(DatasetSizes.small);
      expect(data.length).toBe(DatasetSizes.small);
    });

    it('creates well-formed telemetry updates', () => {
      const data = generateInitialDataset(1);
      const server = data[0];
      
      expect(server).toHaveProperty('id');
      expect(server).toHaveProperty('serverId');
      expect(server).toHaveProperty('region');
      expect(server).toHaveProperty('cpuUsage');
      expect(server).toHaveProperty('memUsage');
      expect(server).toHaveProperty('status');
    });
  });

  describe('simulateTick', () => {
    it('mutates data and updates timestamps', () => {
      const data = generateInitialDataset(DatasetSizes.small);
      const originalTimestamp = data[0].timestamp;
      
      const mockNow = originalTimestamp + 1000;
      const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(mockNow);
      
      simulateTick(data);
      
      expect(data[0].timestamp).toBeLessThanOrEqual(mockNow);
      
      dateSpy.mockRestore();
    });
  });
});
