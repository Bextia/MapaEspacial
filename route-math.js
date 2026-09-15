export const PARSECS_PER_GRID = 1500;
export const MAP_UNITS_PER_GRID = 100;
export const LIGHT_YEARS_PER_PARSEC = 3.26;

export const MAJOR_ROUTE_NAMES = new Set([
  'Perlemian Trade Route',
  'Corellian Run',
  'Corellian Trade Spine',
  'Rimma Trade Route',
  'Hydian Way'
]);

const outerTravelRegions = new Set([
  'Outer Rim',
  'Unknown Regions',
  'Wild Space',
  'Uncharted Region'
]);

export function travelProfile(edge, a, b) {
  if (edge.kind === 'route' && MAJOR_ROUTE_NAMES.has(edge.route)) {
    return { min: 8, max: 8, key: 'major', label: 'Ruta mayor' };
  }
  if (a.region === 'Deep Core' || b.region === 'Deep Core') {
    return { min: 24, max: 48, key: 'deepCore', label: 'Núcleo Profundo' };
  }
  if (outerTravelRegions.has(a.region) || outerTravelRegions.has(b.region)) {
    return { min: 24, max: 24, key: 'outer', label: 'Espacio exterior / inexplorado' };
  }
  return { min: 16, max: 16, key: edge.kind === 'route' ? 'ordinary' : 'local', label: edge.kind === 'route' ? 'Ruta ordinaria' : 'Enlace local' };
}

export function calculateLegMetrics(edge, a, b, hyperdriveClass) {
  const grids = Math.hypot(b.x - a.x, b.y - a.y) / MAP_UNITS_PER_GRID;
  const profile = travelProfile(edge, a, b);
  return {
    grids,
    parsecs: grids * PARSECS_PER_GRID,
    lightYears: grids * PARSECS_PER_GRID * LIGHT_YEARS_PER_PARSEC,
    minHours: grids * profile.min * hyperdriveClass,
    maxHours: grids * profile.max * hyperdriveClass,
    profile
  };
}
