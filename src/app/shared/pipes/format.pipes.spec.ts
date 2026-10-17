import { formatPeso, formatReportDate } from './format.pipes';

describe('format helpers', () => {
  it('formats pesos like the Figma tables', () => {
    expect(formatPeso(100500)).toBe('₱ 100,500.00');
    expect(formatPeso(2500)).toBe('₱ 2,500.00');
    expect(formatPeso(null)).toBe('—');
  });

  it('formats report dates as "Jan 8, 2025 - 08:30:22"', () => {
    expect(formatReportDate(new Date(2025, 0, 8, 8, 30, 22))).toBe('Jan 8, 2025 - 08:30:22');
    expect(formatReportDate(null)).toBe('—');
  });
});
