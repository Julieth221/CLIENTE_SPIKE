import { Color, ScaleType } from '@swimlane/ngx-charts';

export const customColorScheme: Color = {
  name: 'custom',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['#2E7D32', '#4CAF50', '#81C784', '#A5D6A7']
}; 