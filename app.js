import { calculateLegMetrics } from './route-math.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const MAP_SIZE = 4320;
const MAP_FONT = '"Arial Narrow", "Nimbus Sans Narrow", "Liberation Sans Narrow", Arial, sans-serif';
const MAX_ROUTE_STOPS = 8;
const MAX_ROUTE_OPTIONS = 3;
const CANDIDATE_PATHS_PER_LEG = 6;

const translations = {
  es: {
    'document.title': 'Atlas galáctico interactivo',
    'brand.aria': 'Atlas galáctico',
    'brand.title': 'ATLAS GALÁCTICO',
    'brand.subtitle': 'Archivo cartográfico interactivo',
    'common.close': 'Cerrar',
    'mobile.openPanel': 'Abrir panel',
    'mode.aria': 'Modo de uso',
    'mode.explore': 'Explorar',
    'mode.route': 'Calcular ruta',
    'explore.searchLabel': 'Buscar localización',
    'explore.searchPlaceholder': 'Ej. Coruscant, Lothal, Kessel…',
    'explore.clearSearch': 'Limpiar búsqueda',
    'filters.title': 'Capas y filtros',
    'filters.mapLayers': 'Capas del mapa',
    'filters.grid': 'Cuadrícula',
    'filters.regions': 'Regiones',
    'filters.hyperroutes': 'Hiperrutas',
    'filters.sectors': 'Sectores',
    'filters.planets': 'Planetas',
    'filters.locationType': 'Tipo de localización',
    'filters.all': 'Todos',
    'filters.region': 'Región',
    'filters.allRegions': 'Todas las regiones',
    'coords.title': 'Ir a coordenadas',
    'coords.pixels': 'píxeles',
    'coords.center': 'Centrar',
    'route.eyebrow': 'TRAZADOR DE HIPERRUTAS',
    'route.title': 'Planifica un trayecto',
    'route.description': 'Escribe un nombre o activa un campo y pulsa directamente un marcador del mapa.',
    'route.origin': 'Origen',
    'route.originPlaceholder': 'Planeta de salida',
    'route.destination': 'Destino',
    'route.destinationPlaceholder': 'Planeta de destino',
    'route.pickOrigin': 'Elegir origen en el mapa',
    'route.pickDestination': 'Elegir destino en el mapa',
    'route.pickOnMap': 'Elegir en el mapa',
    'route.swap': 'Intercambiar origen y destino',
    'route.reverse': 'Invertir el orden del trayecto',
    'route.addStop': 'Añadir parada',
    'route.stop': 'Parada {number}',
    'route.stopPlaceholder': 'Planeta de la parada',
    'route.pickStop': 'Elegir la parada {number} en el mapa',
    'route.removeStop': 'Eliminar la parada {number}',
    'route.moveStopUp': 'Subir la parada {number}',
    'route.moveStopDown': 'Bajar la parada {number}',
    'route.dragStop': 'Arrastrar para reordenar la parada {number}',
    'route.maximumStops': 'Se permite un máximo de {count} paradas.',
    'route.pickNote': 'Pulsa un campo para elegir ese punto en el mapa.',
    'route.pickActive': 'Selección activa: pulsa en el mapa el {endpoint}.',
    'route.originA': 'origen A',
    'route.destinationB': 'destino {letter}',
    'route.stopTarget': 'parada {number} ({letter})',
    'route.mapPickHint': 'Pulsa un marcador para elegir el {endpoint}',
    'route.hyperdriveLabel': 'Clase del hipermotor',
    'route.class': 'Clase {value}',
    'route.fast': '0,5 · muy rápido',
    'route.slow': '5 · lento',
    'route.hyperdriveHelp': 'Una clase menor reduce el tiempo de viaje.',
    'route.calculate': 'Calcular ruta',
    'route.clear': 'Limpiar',
    'route.noConnection': 'No se ha encontrado conexión entre ambos puntos.',
    'route.jumps.one': '1 salto',
    'route.jumps.many': '{count} saltos',
    'route.totalDistance': 'Distancia total',
    'route.totalTime': 'Tiempo total · clase {class}',
    'route.transferWarning': 'Incluye enlaces locales: no son hiperrutas nominales y se muestran en ámbar discontinuo.',
    'route.validEndpoints': 'Selecciona un origen y un destino válidos.',
    'route.validStops': 'Selecciona una localización válida para cada parada.',
    'route.sameAdjacentPoint': 'Dos puntos consecutivos del trayecto no pueden ser iguales.',
    'route.sameEndpoint': 'El origen y el destino son el mismo punto.',
    'route.selectedOrigin': '{name} seleccionado como origen. Pulsa el destino.',
    'route.selectedDestination': '{name} seleccionado como destino.',
    'route.selectedPoint': '{name} seleccionado como {endpoint}.',
    'route.availableRoutes': 'Rutas disponibles',
    'route.option': 'Ruta {letter}',
    'route.recommended': 'Recomendada',
    'route.showOption': 'Mostrar la ruta {letter}',
    'route.itinerary': 'Itinerario',
    'route.stops.one': '1 parada',
    'route.stops.many': '{count} paradas',
    'route.localLinks.one': '1 enlace local',
    'route.localLinks.many': '{count} enlaces locales',
    'travel.major': 'Ruta mayor',
    'travel.deepCore': 'Núcleo Profundo',
    'travel.outer': 'Espacio exterior / inexplorado',
    'travel.ordinary': 'Ruta ordinaria',
    'travel.local': 'Enlace local',
    'empty.title': 'Selecciona una localización',
    'empty.body': 'Busca por nombre o pulsa cualquier marcador del mapa para abrir su ficha.',
    'footer.about': 'Acerca de los datos',
    'map.aria': 'Mapa galáctico interactivo',
    'map.controls': 'Controles del mapa',
    'map.zoomIn': 'Acercar',
    'map.zoomOut': 'Alejar',
    'map.fit': 'Ver mapa completo',
    'map.hint': 'Arrastra para mover · Rueda para ampliar · Pulsa un marcador para abrir su ficha',
    'map.outside': 'fuera del mapa',
    'type.planet': 'Planeta / sistema',
    'type.station': 'Estación espacial',
    'type.stationShort': 'Estación',
    'type.misc': 'Miscelánea',
    'search.routes': '{count} rutas',
    'search.noResults': 'No hay coincidencias en el catálogo.',
    'detail.noRoute': 'Sin hiperruta nominal registrada',
    'detail.nonCanon': 'Leyendas / no canon',
    'detail.region': 'Región',
    'detail.sector': 'Sector',
    'detail.grid': 'Cuadrícula',
    'detail.pixelCoordinates': 'Coordenadas px',
    'detail.mapCoordinates': 'Coordenadas mapa',
    'detail.topology': 'Topología',
    'detail.crossing': 'Cruce de {count} rutas',
    'detail.onRoute': 'Sobre una ruta',
    'detail.localLink': 'Enlace local',
    'detail.hyperroutes': 'Hiperrutas',
    'detail.wookieepedia': 'Consultar Wookieepedia',
    'wiki.language': 'Idioma de Wookieepedia',
    'wiki.loading': 'Consultando {name} en {language}…',
    'wiki.spanish': 'español',
    'wiki.english': 'inglés',
    'wiki.headerSpanish': 'EN ESPAÑOL',
    'wiki.headerEnglish': 'ORIGINAL EN INGLÉS',
    'wiki.sourceSpanish': 'Texto procedente de la edición española de Wookieepedia. El artículo puede contener más información que esta vista previa.',
    'wiki.sourceEnglish': 'Texto procedente de la edición inglesa de Wookieepedia. El artículo puede contener más información que esta vista previa.',
    'wiki.fallback': 'No se encontró una ficha equivalente en español; se muestra el artículo original en inglés.',
    'wiki.errorTitle': 'No se pudo cargar la vista previa',
    'wiki.errorBody': 'Wookieepedia no ha permitido recuperar ahora el resumen de <strong>{name}</strong>. Puedes intentarlo de nuevo más tarde o cambiar de idioma.',
    'about.eyebrow': 'FUENTES Y ALCANCE',
    'about.title': 'Sobre este prototipo',
    'about.p1': 'El mapa base, creado por Shane Sw5W (@StarWars5W en Twitter), se compone en un lienzo de 4320 × 4320 píxeles con origen en la esquina superior izquierda.',
    'about.p2': 'El catálogo cartográfico procede del conjunto de datos asociado al mapa de referencia. Las hiperrutas enlazan sus paradas en el orden registrado. Cuando dos redes no comparten parada, el planificador utiliza una transferencia local claramente identificada y penalizada.',
    'about.p3': 'Las distancias se estiman sobre la Cuadrícula Galáctica Estándar: 1 cuadrícula equivale a 1.500 pársecs y 1 pársec a 3,26 años luz. El tiempo aplica la clase del hipermotor a una base de 8 horas por cuadrícula en rutas mayores, 16 en rutas ordinarias, 24 en el Borde Exterior y regiones inexploradas, y un intervalo de 24–48 horas en el Núcleo Profundo.',
    'about.p4': 'La capa dinámica usa las posiciones y rótulos extraídos de planetas.svg, incluidas las ampliaciones de Arkanis, Javin y Kessel. ● identifica planetas y sistemas, ¤ estaciones espaciales y § elementos misceláneos. Las localizaciones restantes conservan las coordenadas del catálogo. Las consultas de Wookieepedia se muestran dentro del propio visor.',
    'about.source': 'Mapa y capas: Shane Sw5W. Catálogo complementario: Wason1797/StarWarsMap.',
    'status.loading': 'Cargando catálogo…',
    'status.ready': '{locations} localizaciones · {routes} hiperrutas · {crossings} cruces',
    'status.error': 'No se pudo cargar el catálogo',
    'status.loadError': 'Error al cargar el mapa.',
    'coords.invalid': 'Introduce coordenadas entre 0 y 4320.',
    'unit.lightYears': 'años luz'
  },
  en: {
    'document.title': 'Interactive Galactic Atlas',
    'brand.aria': 'Galactic Atlas',
    'brand.title': 'GALACTIC ATLAS',
    'brand.subtitle': 'Interactive cartographic archive',
    'common.close': 'Close',
    'mobile.openPanel': 'Open panel',
    'mode.aria': 'Use mode',
    'mode.explore': 'Explore',
    'mode.route': 'Plan route',
    'explore.searchLabel': 'Search locations',
    'explore.searchPlaceholder': 'E.g. Coruscant, Lothal, Kessel…',
    'explore.clearSearch': 'Clear search',
    'filters.title': 'Layers and filters',
    'filters.mapLayers': 'Map layers',
    'filters.grid': 'Grid',
    'filters.regions': 'Regions',
    'filters.hyperroutes': 'Hyperroutes',
    'filters.sectors': 'Sectors',
    'filters.planets': 'Planets',
    'filters.locationType': 'Location type',
    'filters.all': 'All',
    'filters.region': 'Region',
    'filters.allRegions': 'All regions',
    'coords.title': 'Go to coordinates',
    'coords.pixels': 'pixels',
    'coords.center': 'Center',
    'route.eyebrow': 'HYPERROUTE PLANNER',
    'route.title': 'Plan a journey',
    'route.description': 'Enter a name or activate a field, then click a marker directly on the map.',
    'route.origin': 'Origin',
    'route.originPlaceholder': 'Departure planet',
    'route.destination': 'Destination',
    'route.destinationPlaceholder': 'Destination planet',
    'route.pickOrigin': 'Choose origin on the map',
    'route.pickDestination': 'Choose destination on the map',
    'route.pickOnMap': 'Choose on the map',
    'route.swap': 'Swap origin and destination',
    'route.reverse': 'Reverse journey order',
    'route.addStop': 'Add stop',
    'route.stop': 'Stop {number}',
    'route.stopPlaceholder': 'Stop location',
    'route.pickStop': 'Choose stop {number} on the map',
    'route.removeStop': 'Remove stop {number}',
    'route.moveStopUp': 'Move stop {number} up',
    'route.moveStopDown': 'Move stop {number} down',
    'route.dragStop': 'Drag to reorder stop {number}',
    'route.maximumStops': 'A maximum of {count} stops is allowed.',
    'route.pickNote': 'Select a field to choose that point on the map.',
    'route.pickActive': 'Active selection: click the {endpoint} on the map.',
    'route.originA': 'origin A',
    'route.destinationB': 'destination {letter}',
    'route.stopTarget': 'stop {number} ({letter})',
    'route.mapPickHint': 'Click a marker to choose {endpoint}',
    'route.hyperdriveLabel': 'Hyperdrive class',
    'route.class': 'Class {value}',
    'route.fast': '0.5 · very fast',
    'route.slow': '5 · slow',
    'route.hyperdriveHelp': 'A lower class reduces travel time.',
    'route.calculate': 'Calculate route',
    'route.clear': 'Clear',
    'route.noConnection': 'No connection was found between these two points.',
    'route.jumps.one': '1 jump',
    'route.jumps.many': '{count} jumps',
    'route.totalDistance': 'Total distance',
    'route.totalTime': 'Total time · class {class}',
    'route.transferWarning': 'Includes local links: these are not named hyperroutes and are shown as dashed amber lines.',
    'route.validEndpoints': 'Select a valid origin and destination.',
    'route.validStops': 'Select a valid location for every stop.',
    'route.sameAdjacentPoint': 'Two consecutive journey points cannot be the same.',
    'route.sameEndpoint': 'The origin and destination are the same point.',
    'route.selectedOrigin': '{name} selected as the origin. Now choose the destination.',
    'route.selectedDestination': '{name} selected as the destination.',
    'route.selectedPoint': '{name} selected as {endpoint}.',
    'route.availableRoutes': 'Available routes',
    'route.option': 'Route {letter}',
    'route.recommended': 'Recommended',
    'route.showOption': 'Show route {letter}',
    'route.itinerary': 'Itinerary',
    'route.stops.one': '1 stop',
    'route.stops.many': '{count} stops',
    'route.localLinks.one': '1 local link',
    'route.localLinks.many': '{count} local links',
    'travel.major': 'Major hyperroute',
    'travel.deepCore': 'Deep Core',
    'travel.outer': 'Outer / unexplored space',
    'travel.ordinary': 'Ordinary route',
    'travel.local': 'Local link',
    'empty.title': 'Select a location',
    'empty.body': 'Search by name or click any marker on the map to open its summary.',
    'footer.about': 'About the data',
    'map.aria': 'Interactive galactic map',
    'map.controls': 'Map controls',
    'map.zoomIn': 'Zoom in',
    'map.zoomOut': 'Zoom out',
    'map.fit': 'View full map',
    'map.hint': 'Drag to move · Scroll to zoom · Click a marker to open its summary',
    'map.outside': 'outside map',
    'type.planet': 'Planet / system',
    'type.station': 'Space station',
    'type.stationShort': 'Station',
    'type.misc': 'Miscellaneous',
    'search.routes': '{count} routes',
    'search.noResults': 'No matches in the catalog.',
    'detail.noRoute': 'No named hyperroute recorded',
    'detail.nonCanon': 'Legends / non-canon',
    'detail.region': 'Region',
    'detail.sector': 'Sector',
    'detail.grid': 'Grid',
    'detail.pixelCoordinates': 'Pixel coordinates',
    'detail.mapCoordinates': 'Map coordinates',
    'detail.topology': 'Topology',
    'detail.crossing': '{count}-route crossing',
    'detail.onRoute': 'On one route',
    'detail.localLink': 'Local link',
    'detail.hyperroutes': 'Hyperroutes',
    'detail.wookieepedia': 'View Wookieepedia',
    'wiki.language': 'Wookieepedia language',
    'wiki.loading': 'Looking up {name} in {language}…',
    'wiki.spanish': 'Spanish',
    'wiki.english': 'English',
    'wiki.headerSpanish': 'SPANISH EDITION',
    'wiki.headerEnglish': 'ORIGINAL ENGLISH',
    'wiki.sourceSpanish': 'Text from the Spanish edition of Wookieepedia. The full article may contain more information than this preview.',
    'wiki.sourceEnglish': 'Text from the English edition of Wookieepedia. The full article may contain more information than this preview.',
    'wiki.fallback': 'No equivalent Spanish page was found, so the original English article is shown.',
    'wiki.errorTitle': 'The preview could not be loaded',
    'wiki.errorBody': 'Wookieepedia did not provide a summary for <strong>{name}</strong> right now. Try again later or switch languages.',
    'about.eyebrow': 'SOURCES AND SCOPE',
    'about.title': 'About this prototype',
    'about.p1': 'The base map, created by Shane Sw5W (@StarWars5W on Twitter), is composed on a 4320 × 4320 pixel canvas with its origin in the upper-left corner.',
    'about.p2': 'The cartographic catalog comes from the dataset associated with the reference map. Hyperroutes link their stops in the recorded order. When two networks share no stop, the planner uses a clearly identified, penalized local transfer.',
    'about.p3': 'Distances are estimated from the Standard Galactic Grid: 1 grid square equals 1,500 parsecs and 1 parsec equals 3.26 light-years. Travel time applies the hyperdrive class to a base of 8 hours per grid square on major routes, 16 on ordinary routes, 24 in the Outer Rim and unexplored regions, and 24–48 hours in the Deep Core.',
    'about.p4': 'The dynamic layer uses the positions and labels extracted from planetas.svg, including the Arkanis, Javin and Kessel insets. ● marks planets and systems, ¤ space stations and § miscellaneous objects. Remaining locations retain their catalog coordinates. Wookieepedia lookups stay inside the atlas.',
    'about.source': 'Map and layers: Shane Sw5W. Supplementary catalog: Wason1797/StarWarsMap.',
    'status.loading': 'Loading catalog…',
    'status.ready': '{locations} locations · {routes} hyperroutes · {crossings} crossings',
    'status.error': 'The catalog could not be loaded',
    'status.loadError': 'Error loading the map.',
    'coords.invalid': 'Enter coordinates between 0 and 4320.',
    'unit.lightYears': 'light-years'
  }
};

const regionNames = {
  es: {
    'Deep Core': 'Núcleo Profundo',
    'Core Worlds': 'Mundos del Núcleo',
    Colonies: 'Colonias',
    'Inner Rim': 'Borde Interior',
    'Expansion Region': 'Región de Expansión',
    'Mid Rim': 'Borde Medio',
    'Hutt Space': 'Espacio Hutt',
    'Outer Rim': 'Borde Exterior',
    'Unknown Regions': 'Regiones Desconocidas',
    'Wild Space': 'Espacio Salvaje',
    'Uncharted Region': 'Región Inexplorada'
  },
  en: {}
};

function initialLocale() {
  try {
    return localStorage.getItem('galactic-atlas-locale') === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

function t(key, variables = {}) {
  const template = translations[state?.locale || 'es']?.[key] ?? translations.es[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => variables[name] ?? `{${name}}`);
}

function localeCode() {
  return state.locale === 'en' ? 'en-US' : 'es-ES';
}

function regionLabel(region) {
  return regionNames[state.locale]?.[region] || region;
}

const canvas = $('#galaxyCanvas');
const stage = $('#mapStage');
const ctx = canvas.getContext('2d', { alpha: false });

const backgroundLayerSources = {
  background: './assets/galaxy-background.png',
  regions: './assets/galaxy-regions.png',
  grid: './assets/galaxy-grid.png',
  sectors: './assets/galaxy-sectors.png',
  hyperroutes: './assets/galaxy-hyperroutes.png',
  planetsBackground: './assets/galaxy-planets-bg.png',
  legend: './assets/galaxy-legend.png'
};
const baseLayerOrder = ['background', 'regions', 'grid', 'sectors', 'hyperroutes'];
const backgroundLayerOrder = [...baseLayerOrder, 'planetsBackground', 'legend'];
const backgroundLayerImages = Object.fromEntries(backgroundLayerOrder.map((key) => {
  const layerImage = new Image();
  layerImage.src = backgroundLayerSources[key];
  return [key, layerImage];
}));

const regionColors = {
  'Deep Core': '#e7df82',
  'Core Worlds': '#c9c45f',
  'Colonies': '#8e88d8',
  'Inner Rim': '#db944f',
  'Expansion Region': '#77bb61',
  'Mid Rim': '#d853b4',
  'Hutt Space': '#ef4b4d',
  'Outer Rim': '#2dc8ec',
  'Unknown Regions': '#657a9d',
  'Wild Space': '#536478',
  'Uncharted Region': '#98a5b5'
};

const insetBounds = {
  arkanis: { left: 168, top: 1680, right: 880, bottom: 2648 },
  javin: { left: 168, top: 2668, right: 880, bottom: 3724 },
  kessel: { left: 168, top: 3744, right: 1048, bottom: 4164 }
};

const state = {
  locale: initialLocale(),
  data: null,
  locations: [],
  byId: new Map(),
  adjacency: [],
  view: { scale: 1, x: 0, y: 0 },
  fitScale: 1,
  dragging: false,
  moved: false,
  pointer: null,
  hovered: null,
  selected: null,
  highlightedPath: null,
  currentRoute: null,
  routePickTarget: null,
  routeFrom: null,
  routeWaypoints: [],
  routeTo: null,
  nextWaypointId: 1,
  hyperdriveClass: 1,
  coordinateTarget: null,
  activeType: 'all',
  activeRegion: 'all',
  layerVisibility: { background: true, grid: true, regions: true, sectors: true, hyperroutes: true, planets: true },
  activeMode: 'explore',
  imageReady: false,
  hasFitted: false,
  locatorStartedAt: 0,
  locatorUntil: 0,
  currentWikiLocation: null,
  wikiRequestId: 0,
  lastFrame: 0
};

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function typeLabel(type) {
  return type === 'station' ? t('type.station') : type === 'misc' ? t('type.misc') : t('type.planet');
}

function routeNameLabel(name) {
  return name === 'Enlace local' ? t('travel.local') : name;
}

function travelProfileLabel(profile) {
  const key = profile.key || ({
    'Ruta mayor': 'major',
    'Núcleo Profundo': 'deepCore',
    'Espacio exterior / inexplorado': 'outer',
    'Ruta ordinaria': 'ordinary',
    'Enlace local': 'local'
  }[profile.label]);
  return t(`travel.${key || 'ordinary'}`);
}

function updateCatalogStatus() {
  const status = $('#catalogStatus');
  if (!state.data) {
    status.innerHTML = `<span class="status-dot"></span>${escapeHtml(t('status.loading'))}`;
    return;
  }
  status.classList.add('ready');
  status.innerHTML = `<span class="status-dot"></span>${escapeHtml(t('status.ready', {
    locations: state.data.meta.locationCount.toLocaleString(localeCode()),
    routes: state.data.meta.routeCount.toLocaleString(localeCode()),
    crossings: state.data.meta.crossingCount.toLocaleString(localeCode())
  }))}`;
}

function applyLocale(locale, persist = true) {
  state.locale = locale === 'en' ? 'en' : 'es';
  document.documentElement.lang = state.locale;
  document.title = t('document.title');
  $$('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  $$('[data-i18n-placeholder]').forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  $$('[data-i18n-aria-label]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel)); });
  $$('[data-i18n-title]').forEach((node) => { node.title = t(node.dataset.i18nTitle); });
  $$('.language-switch [data-locale]').forEach((button) => {
    const active = button.dataset.locale === state.locale;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (persist) {
    try { localStorage.setItem('galactic-atlas-locale', state.locale); } catch { /* Storage can be unavailable in privacy mode. */ }
  }
  updateCatalogStatus();
  if (state.data) {
    populateRegions();
    updateFilterCount();
    renderRouteStops();
    updateRouteEndpointLabels();
    if (state.selected && state.activeMode === 'explore') showDetail(state.selected);
    if (state.currentRoute) renderRouteOptions(state.currentRoute.itineraries, state.currentRoute.points, state.currentRoute.activeIndex, false);
  }
  $('#hyperdriveValue').textContent = t('route.class', { value: formatClass(state.hyperdriveClass) });
  if (state.routePickTarget) {
    const endpoint = routeTargetLabel(state.routePickTarget);
    $('#routePickNote').textContent = t('route.pickActive', { endpoint });
    $('#mapHint').textContent = t('route.mapPickHint', { endpoint });
  } else {
    $('#routePickNote').textContent = t('route.pickNote');
    $('#mapHint').textContent = t('map.hint');
  }
  $$('.suggestions').forEach((node) => node.classList.remove('open'));
  const wikiDialog = $('#wikiDialog');
  if (wikiDialog.open && state.currentWikiLocation) loadWikiLanguage(state.currentWikiLocation, state.locale);
}

function isVisible(location) {
  if (state.activeType !== 'all' && location.category !== state.activeType) return false;
  if (state.activeRegion !== 'all' && location.region !== state.activeRegion) return false;
  return true;
}

function mapToScreen(px, py) {
  return { x: px * state.view.scale + state.view.x, y: py * state.view.scale + state.view.y };
}

function screenToMap(x, y) {
  return { x: (x - state.view.x) / state.view.scale, y: (y - state.view.y) / state.view.scale };
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  canvas.dataset.dpr = dpr;
  if (!state.hasFitted) {
    state.hasFitted = true;
    fitMap();
  }
  requestDraw();
}

function fitMap() {
  const rect = stage.getBoundingClientRect();
  const padding = rect.width < 700 ? 8 : 20;
  state.fitScale = Math.min((rect.width - padding * 2) / MAP_SIZE, (rect.height - padding * 2) / MAP_SIZE);
  state.view.scale = state.fitScale;
  state.view.x = (rect.width - MAP_SIZE * state.view.scale) / 2;
  state.view.y = (rect.height - MAP_SIZE * state.view.scale) / 2;
  state.coordinateTarget = null;
  requestDraw();
}

function zoomAt(screenX, screenY, factor) {
  const old = state.view.scale;
  const next = Math.max(state.fitScale * 0.75, Math.min(5, old * factor));
  const point = screenToMap(screenX, screenY);
  state.view.scale = next;
  state.view.x = screenX - point.x * next;
  state.view.y = screenY - point.y * next;
  requestDraw();
}

function focusPoint(px, py, targetScale = 0.7) {
  const rect = stage.getBoundingClientRect();
  const panelOffset = rect.width > 700 ? 0 : 0;
  state.view.scale = Math.max(state.fitScale * 1.8, Math.min(targetScale, 1.5));
  state.view.x = rect.width / 2 + panelOffset - px * state.view.scale;
  state.view.y = rect.height / 2 - py * state.view.scale;
  requestDraw();
}

function fitPath(nodeIds) {
  if (!nodeIds.length) return;
  const rect = stage.getBoundingClientRect();
  const points = nodeIds.map((id) => state.byId.get(id));
  const minX = Math.min(...points.map((p) => p.px));
  const maxX = Math.max(...points.map((p) => p.px));
  const minY = Math.min(...points.map((p) => p.py));
  const maxY = Math.max(...points.map((p) => p.py));
  const width = Math.max(100, maxX - minX);
  const height = Math.max(100, maxY - minY);
  state.view.scale = Math.max(state.fitScale, Math.min(1.25, Math.min((rect.width - 150) / width, (rect.height - 150) / height)));
  state.view.x = rect.width / 2 - ((minX + maxX) / 2) * state.view.scale;
  state.view.y = rect.height / 2 - ((minY + maxY) / 2) * state.view.scale;
  requestDraw();
}

function requestDraw() {
  if (state.lastFrame) return;
  state.lastFrame = requestAnimationFrame(draw);
}

function locationOccurrences(location) {
  return location.occurrences?.length ? location.occurrences : [{ px: location.px, py: location.py, zone: 'main' }];
}

function representativeOccurrences(location) {
  const groups = new Map();
  for (const occurrence of locationOccurrences(location)) {
    const zone = occurrence.zone || 'main';
    if (!groups.has(zone)) groups.set(zone, []);
    groups.get(zone).push(occurrence);
  }
  return [...groups].map(([zone, occurrences]) => {
    if (zone === 'main') {
      return occurrences.sort((a, b) => (
        Math.hypot(a.px - location.px, a.py - location.py) - Math.hypot(b.px - location.px, b.py - location.py)
      ))[0];
    }
    const bounds = insetBounds[zone];
    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;
    return occurrences.sort((a, b) => (
      Math.hypot(a.px - centerX, a.py - centerY) - Math.hypot(b.px - centerX, b.py - centerY)
    ))[0];
  });
}

function drawMarker(context, location, occurrence) {
  const screenSize = location.rank === 0 ? 12.5 : location.rank === 1 ? 11 : 9.5;
  const fontSize = Math.max(screenSize / state.view.scale, 18);
  context.save();
  context.font = `700 ${fontSize}px ${MAP_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';
  context.strokeStyle = 'rgb(9,22,53)';
  context.lineWidth = Math.max(2.5 / state.view.scale, 4);
  context.fillStyle = regionColors[location.region] || 'rgb(253,244,155)';
  context.strokeText(location.markerSymbol, occurrence.px, occurrence.py);
  context.fillText(location.markerSymbol, occurrence.px, occurrence.py);
  context.restore();
  return fontSize * .34;
}

function labelPosition(occurrence, fontSize) {
  const gap = 7 / state.view.scale;
  const labelCenterX = occurrence.labelX == null ? occurrence.px + 1 : occurrence.labelX + (occurrence.labelWidth || 0) / 2;
  const labelCenterY = occurrence.labelY == null ? occurrence.py : occurrence.labelY + (occurrence.labelHeight || 0) / 2;
  const dx = labelCenterX - occurrence.px;
  const dy = labelCenterY - occurrence.py;
  if (Math.abs(dx) >= Math.abs(dy) * .7) {
    return { x: occurrence.px + Math.sign(dx || 1) * gap, y: occurrence.py + fontSize * .32, align: dx < 0 ? 'right' : 'left' };
  }
  return {
    x: occurrence.px,
    y: occurrence.py + Math.sign(dy || -1) * (gap + fontSize * .25),
    align: 'center'
  };
}

function boxesOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function getLocatorVisual() {
  if (!state.selected || state.activeMode !== 'explore' || !state.layerVisibility.planets) return null;
  const now = performance.now();
  const animating = now < state.locatorUntil;
  const progress = animating ? Math.min(1, (now - state.locatorStartedAt) / (state.locatorUntil - state.locatorStartedAt)) : 1;
  const eased = 1 - ((1 - progress) ** 3);
  const finalRadius = 10 / state.view.scale;
  return {
    location: state.selected,
    occurrences: representativeOccurrences(state.selected),
    animating,
    eased,
    radius: 88 + (finalRadius - 88) * eased
  };
}

function drawLocatorCrosshair(context, occurrence, radius) {
  const bounds = insetBounds[occurrence.zone] || { left: 0, top: 0, right: MAP_SIZE, bottom: MAP_SIZE };
  const gap = radius + 5 / state.view.scale;
  context.save();
  context.beginPath();
  context.rect(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
  context.clip();
  context.beginPath();
  context.moveTo(occurrence.px, bounds.top);
  context.lineTo(occurrence.px, Math.max(bounds.top, occurrence.py - gap));
  context.moveTo(occurrence.px, Math.min(bounds.bottom, occurrence.py + gap));
  context.lineTo(occurrence.px, bounds.bottom);
  context.moveTo(bounds.left, occurrence.py);
  context.lineTo(Math.max(bounds.left, occurrence.px - gap), occurrence.py);
  context.moveTo(Math.min(bounds.right, occurrence.px + gap), occurrence.py);
  context.lineTo(bounds.right, occurrence.py);
  context.strokeStyle = 'rgba(242,245,66,.88)';
  context.lineWidth = 1.75 / state.view.scale;
  context.shadowColor = 'rgba(2,7,13,.95)';
  context.shadowBlur = 3 / state.view.scale;
  context.stroke();
  context.restore();
}

function draw() {
  state.lastFrame = 0;
  const dpr = Number(canvas.dataset.dpr || 1);
  const rect = stage.getBoundingClientRect();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#050b13';
  ctx.fillRect(0, 0, rect.width, rect.height);
  if (!state.imageReady || !state.data) return;

  ctx.save();
  ctx.translate(state.view.x, state.view.y);
  ctx.scale(state.view.scale, state.view.scale);
  ctx.imageSmoothingEnabled = true;
  for (const layer of baseLayerOrder) {
    if (layer === 'background' || state.layerVisibility[layer]) ctx.drawImage(backgroundLayerImages[layer], 0, 0, MAP_SIZE, MAP_SIZE);
  }
  if (state.layerVisibility.planets) ctx.drawImage(backgroundLayerImages.planetsBackground, 0, 0, MAP_SIZE, MAP_SIZE);

  if (state.highlightedPath) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const edge of state.highlightedPath.edges) {
      const a = state.byId.get(edge.a);
      const b = state.byId.get(edge.b);
      const aByZone = new Map(representativeOccurrences(a).map((occurrence) => [occurrence.zone || 'main', occurrence]));
      const bByZone = new Map(representativeOccurrences(b).map((occurrence) => [occurrence.zone || 'main', occurrence]));
      for (const [zone, from] of aByZone) {
        const to = bByZone.get(zone);
        if (!to) continue;
        ctx.beginPath();
        ctx.moveTo(from.px, from.py);
        ctx.lineTo(to.px, to.py);
        ctx.lineWidth = (edge.kind === 'route' ? 4.5 : 3) / state.view.scale;
        ctx.strokeStyle = edge.kind === 'route' ? '#ff4157' : '#ffb865';
        ctx.setLineDash(edge.kind === 'route' ? [] : [7 / state.view.scale, 5 / state.view.scale]);
        ctx.shadowColor = ctx.strokeStyle;
        ctx.shadowBlur = 8 / state.view.scale;
        ctx.globalAlpha = .95;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  const locator = getLocatorVisual();
  if (locator) {
    for (const occurrence of locator.occurrences) drawLocatorCrosshair(ctx, occurrence, locator.radius);
  }

  const selectedId = state.selected?.id;
  if (state.layerVisibility.planets) {
    const labelThreshold = state.view.scale > .76 ? 3 : state.view.scale > .5 ? 2 : state.view.scale > .28 ? 1 : 0;
    const labelCandidates = [];
    for (const location of state.locations) {
      if (!isVisible(location) && location.id !== selectedId) continue;
      for (const occurrence of locationOccurrences(location)) {
        const radius = drawMarker(ctx, location, occurrence);
        if (location.routes.length > 1) {
          ctx.beginPath();
          ctx.arc(occurrence.px, occurrence.py, radius + 2.2 / state.view.scale, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffbd66';
          ctx.lineWidth = 1.1 / state.view.scale;
          ctx.globalAlpha = .85;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        if (labelThreshold >= location.rank || location.id === selectedId || location.id === state.hovered?.id) {
          labelCandidates.push({ location, occurrence });
        }
      }
    }
    labelCandidates.sort((a, b) => (
      Number(b.location.id === selectedId) - Number(a.location.id === selectedId)
      || Number(b.location.id === state.hovered?.id) - Number(a.location.id === state.hovered?.id)
      || a.location.rank - b.location.rank
    ));
    const placedLabels = [];
    for (const { location, occurrence } of labelCandidates) {
      const fontSize = Math.max(12.5 / state.view.scale, 18);
      ctx.font = `${fontSize}px ${MAP_FONT}`;
      const position = labelPosition(occurrence, fontSize);
      const width = ctx.measureText(location.mapLabel || location.name).width;
      const left = position.align === 'right' ? position.x - width : position.align === 'center' ? position.x - width / 2 : position.x;
      const box = { left, right: left + width, top: position.y - fontSize * .86, bottom: position.y + fontSize * .25 };
      const forced = location.id === selectedId || location.id === state.hovered?.id;
      if (!forced && placedLabels.some((placed) => boxesOverlap(box, placed))) continue;
      placedLabels.push(box);
      ctx.save();
      ctx.font = `${fontSize}px ${MAP_FONT}`;
      ctx.textAlign = position.align;
      ctx.textBaseline = 'alphabetic';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgb(9,22,53)';
      ctx.lineWidth = Math.max(3.25 / state.view.scale, 5);
      ctx.fillStyle = 'rgb(253,244,155)';
      ctx.strokeText(location.mapLabel || location.name, position.x, position.y);
      ctx.fillText(location.mapLabel || location.name, position.x, position.y);
      ctx.restore();
    }
  }

  if (state.layerVisibility.planets && state.hovered && state.hovered.id !== selectedId && isVisible(state.hovered)) {
    for (const occurrence of representativeOccurrences(state.hovered)) {
      ctx.beginPath();
      ctx.arc(occurrence.px, occurrence.py, 9 / state.view.scale, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 / state.view.scale;
      ctx.shadowColor = '#4bdcf5';
      ctx.shadowBlur = 10 / state.view.scale;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  if (locator) {
    const { radius: locatorRadius, eased, animating } = locator;
    for (const occurrence of locator.occurrences) {
      ctx.beginPath();
      ctx.arc(occurrence.px, occurrence.py, locatorRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgb(242,245,66)';
      ctx.lineWidth = 2 / state.view.scale;
      ctx.globalAlpha = .55 + eased * .45;
      ctx.shadowColor = 'rgb(242,245,66)';
      ctx.shadowBlur = 13 / state.view.scale;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    if (animating) requestDraw();
  }

  const drawRouteEndpoint = (location, label, color) => {
    if (!location) return;
    for (const occurrence of representativeOccurrences(location)) {
      const radius = 9 / state.view.scale;
      ctx.beginPath();
      ctx.arc(occurrence.px, occurrence.py, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(3,10,18,.92)';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / state.view.scale;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8 / state.view.scale;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      ctx.font = `800 ${10 / state.view.scale}px ${MAP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, occurrence.px, occurrence.py + .3 / state.view.scale);
    }
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  };
  drawRouteEndpoint(state.routeFrom, 'A', '#4bdcf5');
  state.routeWaypoints.forEach((waypoint, index) => drawRouteEndpoint(waypoint.location, routeLetter(index + 1), '#f2f542'));
  drawRouteEndpoint(state.routeTo, routeLetter(state.routeWaypoints.length + 1), '#ffbc64');

  if (state.coordinateTarget) {
    const { x, y } = state.coordinateTarget;
    ctx.strokeStyle = '#ffbc64';
    ctx.lineWidth = 1.5 / state.view.scale;
    ctx.beginPath();
    ctx.moveTo(x - 12 / state.view.scale, y);
    ctx.lineTo(x + 12 / state.view.scale, y);
    ctx.moveTo(x, y - 12 / state.view.scale);
    ctx.lineTo(x, y + 12 / state.view.scale);
    ctx.stroke();
  }
  ctx.drawImage(backgroundLayerImages.legend, 0, 0, MAP_SIZE, MAP_SIZE);
  ctx.restore();
}

function findMatches(query, limit = 8) {
  const q = normalize(query);
  if (!q) return [];
  return state.locations
    .map((location) => {
      const name = normalize(location.name);
      const aliases = location.aliases.map(normalize);
      let score = name === q ? 0 : name.startsWith(q) ? 1 : aliases.some((a) => a.startsWith(q)) ? 2 : name.includes(q) ? 3 : aliases.some((a) => a.includes(q)) ? 4 : 99;
      return { location, score };
    })
    .filter((item) => item.score < 99)
    .sort((a, b) => a.score - b.score || a.location.name.localeCompare(b.location.name))
    .slice(0, limit)
    .map((item) => item.location);
}

function resolveInput(input) {
  const id = Number(input.dataset.locationId);
  if (Number.isInteger(id) && state.byId.has(id) && state.byId.get(id).name === input.value) return state.byId.get(id);
  const q = normalize(input.value);
  return state.locations.find((p) => normalize(p.name) === q || p.aliases.some((a) => normalize(a) === q)) || null;
}

function attachAutocomplete(input, container, onSelect) {
  let active = -1;
  const render = () => {
    const matches = findMatches(input.value);
    active = -1;
    if (!input.value.trim()) {
      container.classList.remove('open');
      return;
    }
    container.innerHTML = matches.length ? matches.map((p, i) => `
      <button class="suggestion" type="button" role="option" data-id="${p.id}" data-index="${i}">
        <span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(regionLabel(p.region))} · ${escapeHtml(p.grid)}</small></span>
        <span class="suggestion-tag">${escapeHtml(p.routes.length > 1 ? t('search.routes', { count: p.routes.length }) : typeLabel(p.category))}</span>
      </button>`).join('') : `<div class="no-results">${escapeHtml(t('search.noResults'))}</div>`;
    container.classList.add('open');
    [...container.querySelectorAll('.suggestion')].forEach((button) => button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const location = state.byId.get(Number(button.dataset.id));
      input.value = location.name;
      input.dataset.locationId = location.id;
      container.classList.remove('open');
      onSelect(location);
    }));
  };
  input.addEventListener('input', () => {
    delete input.dataset.locationId;
    render();
  });
  input.addEventListener('focus', render);
  input.addEventListener('blur', () => setTimeout(() => container.classList.remove('open'), 120));
  input.addEventListener('keydown', (event) => {
    const options = [...container.querySelectorAll('.suggestion')];
    if (event.key === 'ArrowDown' && options.length) active = Math.min(active + 1, options.length - 1);
    else if (event.key === 'ArrowUp' && options.length) active = Math.max(active - 1, 0);
    else if (event.key === 'Enter') {
      const chosen = options[active] || options[0];
      if (chosen) chosen.dispatchEvent(new PointerEvent('pointerdown'));
      else {
        const exact = resolveInput(input);
        if (exact) onSelect(exact);
      }
      event.preventDefault();
      return;
    } else if (event.key === 'Escape') {
      container.classList.remove('open');
      return;
    } else return;
    options.forEach((option, index) => option.classList.toggle('active', index === active));
    event.preventDefault();
  });
}

function selectLocation(location, focus = true) {
  if (!state.layerVisibility.planets) {
    state.layerVisibility.planets = true;
    const planetsControl = $('[data-map-layer="planets"]');
    if (planetsControl) planetsControl.checked = true;
  }
  state.selected = location;
  state.locatorStartedAt = performance.now();
  state.locatorUntil = state.locatorStartedAt + 1350;
  state.coordinateTarget = null;
  showDetail(location);
  if (focus) focusPoint(location.px, location.py);
  if (window.innerWidth <= 880) $('#sidebar').classList.add('open');
  requestAnimationFrame(() => $('#detailCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  requestDraw();
}

function showDetail(location) {
  const card = $('#detailCard');
  card.classList.remove('empty');
  const color = regionColors[location.region] || '#b7c4d2';
  const routes = location.routes.length
    ? location.routes.map((route) => `<span class="route-chip">${escapeHtml(route)}</span>`).join('')
    : `<span class="route-chip muted">${escapeHtml(t('detail.noRoute'))}</span>`;
  const topology = location.routes.length > 1
    ? t('detail.crossing', { count: location.routes.length })
    : location.routes.length === 1 ? t('detail.onRoute') : t('detail.localLink');
  card.innerHTML = `
    <div class="detail-top">
      <div>
        <div class="detail-kicker"><i class="shape shape-${location.category === 'station' ? 'square' : location.category === 'misc' ? 'diamond' : 'circle'}" style="color:${color}"></i>${escapeHtml(typeLabel(location.category))}</div>
        <h2>${escapeHtml(location.name)}</h2>
      </div>
      <span class="canon-badge">${location.canon ? 'Canon' : escapeHtml(t('detail.nonCanon'))}</span>
    </div>
    <div class="detail-grid">
      <div class="datum"><span>${escapeHtml(t('detail.region'))}</span><strong>${escapeHtml(regionLabel(location.region))}</strong></div>
      <div class="datum"><span>${escapeHtml(t('detail.sector'))}</span><strong>${escapeHtml(location.sector)}</strong></div>
      <div class="datum"><span>${escapeHtml(t('detail.grid'))}</span><strong>${escapeHtml(location.grid)}</strong></div>
      <div class="datum"><span>${escapeHtml(t('detail.pixelCoordinates'))}</span><strong>${Math.round(location.px)}, ${Math.round(location.py)}</strong></div>
      <div class="datum"><span>${escapeHtml(t('detail.mapCoordinates'))}</span><strong>${location.x}, ${location.y}</strong></div>
      <div class="datum"><span>${escapeHtml(t('detail.topology'))}</span><strong>${escapeHtml(topology)}</strong></div>
    </div>
    <div class="route-list-label">${escapeHtml(t('detail.hyperroutes'))}</div>
    <div class="route-chips">${routes}</div>
    <button class="wiki-link" type="button" data-wiki-id="${location.id}"><span>${escapeHtml(t('detail.wookieepedia'))}</span><span>▣</span></button>`;
  card.querySelector('.wiki-link').addEventListener('click', () => openWikiModal(location));
}

function wikiArticleTitle(location) {
  try {
    const url = new URL(location.wiki);
    const marker = '/wiki/';
    const index = url.pathname.indexOf(marker);
    if (index === -1 || url.pathname.includes('Special:Search')) return location.name;
    return decodeURIComponent(url.pathname.slice(index + marker.length)).replaceAll('_', ' ');
  } catch {
    return location.name;
  }
}

async function openWikiModal(location) {
  const dialog = $('#wikiDialog');
  state.currentWikiLocation = location;
  dialog.showModal();
  await loadWikiLanguage(location, state.locale);
}

function wikiEndpoint(language) {
  return language === 'es' ? 'https://starwars.fandom.com/es/api.php' : 'https://starwars.fandom.com/api.php';
}

async function fetchWikiPage(location, language) {
  const endpoint = wikiEndpoint(language);
  const title = wikiArticleTitle(location);
  const makeParams = (requestedTitle) => new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    redirects: '1',
    prop: 'extracts|pageimages|description|info',
    inprop: 'url',
    exintro: '1',
    explaintext: '1',
    piprop: 'thumbnail',
    pithumbsize: '760',
    titles: requestedTitle
  });

  let response = await fetch(`${endpoint}?${makeParams(title)}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  let payload = await response.json();
  let page = Object.values(payload?.query?.pages || {})[0];

  if (!page || page.missing !== undefined) {
    const searchParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      origin: '*',
      generator: 'search',
      gsrsearch: `intitle:${location.name}`,
      gsrnamespace: '0',
      gsrlimit: '1',
      prop: 'extracts|pageimages|description|info',
      inprop: 'url',
      exintro: '1',
      explaintext: '1',
      piprop: 'thumbnail',
      pithumbsize: '760'
    });
    response = await fetch(`${endpoint}?${searchParams}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    payload = await response.json();
    page = Object.values(payload?.query?.pages || {})[0];
  }

  if (!page || page.missing !== undefined) throw new Error('Artículo no encontrado');
  let extract = page.extract?.trim() || '';
  if (extract.length < 120) extract = await fetchWikiParsedIntro(page.title || title, endpoint);
  if (!extract) throw new Error('Artículo sin texto recuperable');
  return { page, extract, endpoint };
}

async function loadWikiLanguage(location, language, fallbackNotice = '') {
  const dialog = $('#wikiDialog');
  const content = $('#wikiModalContent');
  const requestId = ++state.wikiRequestId;
  const languageName = language === 'es' ? t('wiki.spanish') : t('wiki.english');
  content.innerHTML = `
    <div class="wiki-modal-top">
      <span class="eyebrow">WOOKIEEPEDIA</span>
      ${wikiLanguageSwitch(language)}
    </div>
    <div class="wiki-loading"><span></span><p>${escapeHtml(t('wiki.loading', { name: location.name, language: languageName }))}</p></div>`;
  try {
    const { page, extract } = await fetchWikiPage(location, language);
    if (requestId !== state.wikiRequestId || !dialog.open) return;
    content.innerHTML = `
      <div class="wiki-modal-top">
        <span class="eyebrow">WOOKIEEPEDIA · ${escapeHtml(language === 'es' ? t('wiki.headerSpanish') : t('wiki.headerEnglish'))}</span>
        ${wikiLanguageSwitch(language)}
      </div>
      ${fallbackNotice ? `<div class="wiki-language-notice">${escapeHtml(fallbackNotice)}</div>` : ''}
      <div class="wiki-layout">
        ${page.thumbnail?.source ? `<img class="wiki-hero" src="${escapeHtml(page.thumbnail.source)}" alt="">` : ''}
        <div class="wiki-main">
          <div class="wiki-article-head">
            <div><h2>${escapeHtml(page.title || location.name)}</h2>${page.description ? `<p class="wiki-description">${escapeHtml(page.description)}</p>` : ''}</div>
            <span class="canon-badge">${location.canon ? 'Canon' : escapeHtml(t('detail.nonCanon'))}</span>
          </div>
          <div class="wiki-extract">${extract.split(/\n{2,}/).slice(0, 6).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
        </div>
      </div>
      <div class="wiki-source-note">${escapeHtml(language === 'es' ? t('wiki.sourceSpanish') : t('wiki.sourceEnglish'))}</div>
      <div class="dialog-actions">
        <button type="button" data-close-wiki>${escapeHtml(t('common.close'))}</button>
      </div>`;
    bindWikiModalControls(location, language);
    content.querySelector('[data-close-wiki]').addEventListener('click', () => dialog.close());
  } catch (error) {
    if (requestId !== state.wikiRequestId || !dialog.open) return;
    if (language === 'es') {
      console.info('No se encontró contenido en español; se usará la edición inglesa.', error);
      await loadWikiLanguage(location, 'en', t('wiki.fallback'));
      return;
    }
    console.warn('No se pudo cargar la vista previa de Wookieepedia:', error);
    content.innerHTML = `
      <div class="wiki-modal-top"><span class="eyebrow">WOOKIEEPEDIA</span>${wikiLanguageSwitch(language)}</div>
      <div class="wiki-error-icon">!</div>
      <h2>${escapeHtml(t('wiki.errorTitle'))}</h2>
      <p class="wiki-error-copy">${t('wiki.errorBody', { name: escapeHtml(location.name) })}</p>
      <div class="dialog-actions">
        <button type="button" data-close-wiki>${escapeHtml(t('common.close'))}</button>
      </div>`;
    bindWikiModalControls(location, language);
    content.querySelector('[data-close-wiki]').addEventListener('click', () => dialog.close());
  }
}

function wikiLanguageSwitch(activeLanguage) {
  return `<div class="wiki-language-switch" aria-label="${escapeHtml(t('wiki.language'))}">
    <button type="button" data-wiki-language="es" class="${activeLanguage === 'es' ? 'active' : ''}">${escapeHtml(t('wiki.spanish'))}</button>
    <button type="button" data-wiki-language="en" class="${activeLanguage === 'en' ? 'active' : ''}">${escapeHtml(t('wiki.english'))}</button>
  </div>`;
}

function bindWikiModalControls(location, activeLanguage) {
  $('#wikiModalContent').querySelectorAll('[data-wiki-language]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.wikiLanguage !== activeLanguage) loadWikiLanguage(location, button.dataset.wikiLanguage);
    });
  });
}

async function fetchWikiParsedIntro(title, endpoint) {
  const params = new URLSearchParams({
    action: 'parse',
    format: 'json',
    origin: '*',
    redirects: '1',
    disabletoc: '1',
    disableeditsection: '1',
    prop: 'text',
    page: title
  });
  const response = await fetch(`${endpoint}?${params}`);
  if (!response.ok) return '';
  const payload = await response.json();
  const html = payload?.parse?.text?.['*'];
  if (!html) return '';
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  documentFragment.querySelectorAll('table, aside, figure, style, script, sup, .portable-infobox, .navbox, .toc, .gallery, .reference, .mw-editsection, .mw-empty-elt').forEach((node) => node.remove());
  const paragraphs = [...documentFragment.querySelectorAll('.mw-parser-output > p, p')]
    .map((node) => node.textContent.replace(/\s+/g, ' ').trim())
    .filter((text, index, list) => text.length >= 70 && list.indexOf(text) === index)
    .slice(0, 5);
  return paragraphs.join('\n\n');
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

class MinHeap {
  constructor() { this.items = []; }
  push(item) {
    this.items.push(item);
    let i = this.items.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.items[p].distance <= item.distance) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = item;
  }
  pop() {
    if (!this.items.length) return null;
    const first = this.items[0];
    const last = this.items.pop();
    if (this.items.length) {
      let i = 0;
      while (true) {
        const left = i * 2 + 1;
        const right = left + 1;
        if (left >= this.items.length) break;
        let child = right < this.items.length && this.items[right].distance < this.items[left].distance ? right : left;
        if (this.items[child].distance >= last.distance) break;
        this.items[i] = this.items[child];
        i = child;
      }
      this.items[i] = last;
    }
    return first;
  }
}

function shortestPath(start, end, { bannedEdges = new Set(), bannedNodes = new Set() } = {}) {
  const n = state.locations.length;
  const dist = new Float64Array(n);
  dist.fill(Infinity);
  const previous = new Int32Array(n);
  previous.fill(-1);
  const previousEdge = new Int32Array(n);
  previousEdge.fill(-1);
  const heap = new MinHeap();
  if (bannedNodes.has(start.id) || bannedNodes.has(end.id)) return null;
  dist[start.id] = 0;
  heap.push({ id: start.id, distance: 0 });
  while (heap.items.length) {
    const current = heap.pop();
    if (current.distance !== dist[current.id]) continue;
    if (current.id === end.id) break;
    for (const step of state.adjacency[current.id]) {
      if (bannedEdges.has(step.edgeIndex) || bannedNodes.has(step.to)) continue;
      const edge = state.data.edges[step.edgeIndex];
      const nextDistance = current.distance + edge.weight;
      if (nextDistance < dist[step.to]) {
        dist[step.to] = nextDistance;
        previous[step.to] = current.id;
        previousEdge[step.to] = step.edgeIndex;
        heap.push({ id: step.to, distance: nextDistance });
      }
    }
  }
  if (!Number.isFinite(dist[end.id])) return null;
  const nodes = [];
  const edgeIndexes = [];
  let cursor = end.id;
  while (cursor !== -1) {
    nodes.push(cursor);
    const edgeIndex = previousEdge[cursor];
    if (edgeIndex !== -1) edgeIndexes.push(edgeIndex);
    if (cursor === start.id) break;
    cursor = previous[cursor];
  }
  nodes.reverse();
  edgeIndexes.reverse();
  return { nodes, edgeIndexes, edges: edgeIndexes.map((index) => state.data.edges[index]), distance: dist[end.id] };
}

function pathKey(path) {
  return path.nodes.join('>');
}

function pathDistance(edgeIndexes) {
  return edgeIndexes.reduce((sum, edgeIndex) => sum + state.data.edges[edgeIndex].weight, 0);
}

function kShortestPaths(start, end, limit = CANDIDATE_PATHS_PER_LEG) {
  const first = shortestPath(start, end);
  if (!first) return [];
  const accepted = [first];
  const acceptedKeys = new Set([pathKey(first)]);
  const candidates = new MinHeap();
  const candidateKeys = new Set();

  while (accepted.length < limit) {
    const previousPath = accepted[accepted.length - 1];
    for (let spurIndex = 0; spurIndex < previousPath.nodes.length - 1; spurIndex += 1) {
      const rootNodes = previousPath.nodes.slice(0, spurIndex + 1);
      const rootEdges = previousPath.edgeIndexes.slice(0, spurIndex);
      const bannedEdges = new Set();
      for (const path of accepted) {
        const sharesRoot = rootNodes.every((nodeId, index) => path.nodes[index] === nodeId);
        if (!sharesRoot || path.nodes[spurIndex + 1] === undefined) continue;
        const nextNode = path.nodes[spurIndex + 1];
        for (const step of state.adjacency[path.nodes[spurIndex]]) {
          if (step.to === nextNode) bannedEdges.add(step.edgeIndex);
        }
      }
      const bannedNodes = new Set(rootNodes.slice(0, -1));
      const spurStart = state.byId.get(rootNodes[rootNodes.length - 1]);
      const spurPath = shortestPath(spurStart, end, { bannedEdges, bannedNodes });
      if (!spurPath) continue;
      const nodes = [...rootNodes.slice(0, -1), ...spurPath.nodes];
      if (new Set(nodes).size !== nodes.length) continue;
      const edgeIndexes = [...rootEdges, ...spurPath.edgeIndexes];
      const path = {
        nodes,
        edgeIndexes,
        edges: edgeIndexes.map((index) => state.data.edges[index]),
        distance: pathDistance(edgeIndexes)
      };
      const key = pathKey(path);
      if (acceptedKeys.has(key) || candidateKeys.has(key)) continue;
      candidateKeys.add(key);
      candidates.push(path);
    }

    let next = candidates.pop();
    while (next && acceptedKeys.has(pathKey(next))) next = candidates.pop();
    if (!next) break;
    accepted.push(next);
    acceptedKeys.add(pathKey(next));
  }
  return accepted;
}

function combineSegmentPaths(points, segmentPaths) {
  const nodes = [];
  const edgeIndexes = [];
  segmentPaths.forEach((path, index) => {
    nodes.push(...(index === 0 ? path.nodes : path.nodes.slice(1)));
    edgeIndexes.push(...path.edgeIndexes);
  });
  return {
    nodes,
    edgeIndexes,
    edges: edgeIndexes.map((index) => state.data.edges[index]),
    distance: segmentPaths.reduce((sum, path) => sum + path.distance, 0),
    points,
    segments: segmentPaths
  };
}

function edgeSimilarity(a, b) {
  const segmentSet = (path) => new Set(path.nodes.slice(0, -1).map((nodeId, index) => {
    const nextId = path.nodes[index + 1];
    return nodeId < nextId ? `${nodeId}:${nextId}` : `${nextId}:${nodeId}`;
  }));
  const aEdges = segmentSet(a);
  const bEdges = segmentSet(b);
  const intersection = [...aEdges].filter((edge) => bEdges.has(edge)).length;
  const union = new Set([...aEdges, ...bEdges]).size;
  return union ? intersection / union : 1;
}

function kBestItineraries(points, limit = MAX_ROUTE_OPTIONS) {
  const legOptions = [];
  for (let index = 0; index < points.length - 1; index += 1) {
    const options = kShortestPaths(points[index], points[index + 1]);
    if (!options.length) return [];
    legOptions.push(options);
  }

  const combinations = new MinHeap();
  const seen = new Set();
  const enqueue = (indexes) => {
    const key = indexes.join(':');
    if (seen.has(key)) return;
    seen.add(key);
    combinations.push({
      indexes,
      distance: indexes.reduce((sum, optionIndex, legIndex) => sum + legOptions[legIndex][optionIndex].distance, 0)
    });
  };
  enqueue(Array(legOptions.length).fill(0));

  const itineraries = [];
  let inspected = 0;
  while (combinations.items.length && itineraries.length < limit && inspected < 180) {
    inspected += 1;
    const combination = combinations.pop();
    const segmentPaths = combination.indexes.map((optionIndex, legIndex) => legOptions[legIndex][optionIndex]);
    const itinerary = combineSegmentPaths(points, segmentPaths);
    if (itineraries.every((existing) => edgeSimilarity(existing, itinerary) <= .9)) itineraries.push(itinerary);

    combination.indexes.forEach((optionIndex, legIndex) => {
      if (optionIndex + 1 >= legOptions[legIndex].length) return;
      const nextIndexes = [...combination.indexes];
      nextIndexes[legIndex] += 1;
      enqueue(nextIndexes);
    });
  }
  return itineraries;
}

function formatClass(value) {
  return Number(value).toLocaleString(localeCode(), { minimumFractionDigits: value % 1 ? 1 : 0, maximumFractionDigits: 1 });
}

function formatParsecs(value) {
  return `${Math.round(value).toLocaleString(localeCode())} pc`;
}

function formatLightYears(value) {
  return `${Math.round(value).toLocaleString(localeCode())} ${t('unit.lightYears')}`;
}

function formatHours(value) {
  if (value < 24) return `${value.toLocaleString(localeCode(), { maximumFractionDigits: 1 })} h`;
  const days = Math.floor(value / 24);
  const hours = Math.round((value - days * 24) * 10) / 10;
  return hours ? `${days.toLocaleString(localeCode())} d ${hours.toLocaleString(localeCode(), { maximumFractionDigits: 1 })} h` : `${days.toLocaleString(localeCode())} d`;
}

function formatTravelTime(minHours, maxHours) {
  return Math.abs(maxHours - minHours) < .05 ? formatHours(minHours) : `${formatHours(minHours)}–${formatHours(maxHours)}`;
}

function routeLegMetrics(path, index) {
  const edge = path.edges[index];
  const a = state.byId.get(path.nodes[index]);
  const b = state.byId.get(path.nodes[index + 1]);
  return { edge, a, b, ...calculateLegMetrics(edge, a, b, state.hyperdriveClass) };
}

function routeMetrics(path) {
  const legs = path.edges.map((_, index) => routeLegMetrics(path, index));
  const totals = legs.reduce((sum, leg) => ({
    parsecs: sum.parsecs + leg.parsecs,
    minHours: sum.minHours + leg.minHours,
    maxHours: sum.maxHours + leg.maxHours
  }), { parsecs: 0, minHours: 0, maxHours: 0 });
  return {
    legs,
    totals,
    localLinks: path.edges.filter((edge) => edge.kind !== 'route').length
  };
}

function routeLetter(index) {
  return String.fromCharCode(65 + Math.min(index, 25));
}

function renderRouteOptions(itineraries, points, activeIndex = 0, refocus = true) {
  const result = $('#routeResult');
  if (!itineraries?.length) {
    result.classList.remove('hidden');
    result.innerHTML = `<p class="route-warning">${escapeHtml(t('route.noConnection'))}</p>`;
    state.currentRoute = null;
    state.highlightedPath = null;
    requestDraw();
    return;
  }

  const selectedIndex = Math.max(0, Math.min(activeIndex, itineraries.length - 1));
  const path = itineraries[selectedIndex];
  const { legs, totals } = routeMetrics(path);
  const hasTransfers = path.edges.some((edge) => edge.kind !== 'route');
  const start = points[0];
  const end = points[points.length - 1];
  const stopCount = Math.max(0, points.length - 2);
  const optionCards = itineraries.length > 1 ? `
    <div class="route-options-heading">${escapeHtml(t('route.availableRoutes'))}</div>
    <div class="route-options" role="tablist" aria-label="${escapeHtml(t('route.availableRoutes'))}">
      ${itineraries.map((option, index) => {
        const metrics = routeMetrics(option);
        const letter = routeLetter(index);
        const jumpLabel = t(option.edges.length === 1 ? 'route.jumps.one' : 'route.jumps.many', { count: option.edges.length });
        const localLabel = metrics.localLinks
          ? t(metrics.localLinks === 1 ? 'route.localLinks.one' : 'route.localLinks.many', { count: metrics.localLinks })
          : '';
        return `<button class="route-option ${index === selectedIndex ? 'active' : ''}" type="button" role="tab" aria-selected="${index === selectedIndex}" aria-label="${escapeHtml(t('route.showOption', { letter }))}" data-route-option="${index}">
          <span class="route-option-title"><strong>${escapeHtml(t('route.option', { letter }))}</strong>${index === 0 ? `<em>${escapeHtml(t('route.recommended'))}</em>` : ''}</span>
          <b>${escapeHtml(formatTravelTime(metrics.totals.minHours, metrics.totals.maxHours))}</b>
          <small>${escapeHtml(formatParsecs(metrics.totals.parsecs))} · ${escapeHtml(jumpLabel)}${localLabel ? ` · ${escapeHtml(localLabel)}` : ''}</small>
        </button>`;
      }).join('')}
    </div>` : '';

  result.classList.remove('hidden');
  result.innerHTML = `
    ${optionCards}
    <div class="route-itinerary-label">${escapeHtml(t('route.itinerary'))}</div>
    <div class="route-itinerary-points">${points.map((point, index) => `<span><b>${routeLetter(index)}</b>${escapeHtml(point.name)}</span>${index < points.length - 1 ? '<i aria-hidden="true">›</i>' : ''}`).join('')}</div>
    <div class="route-summary"><strong>${escapeHtml(start.name)} → ${escapeHtml(end.name)}</strong><span>${stopCount ? `${escapeHtml(t(stopCount === 1 ? 'route.stops.one' : 'route.stops.many', { count: stopCount }))} · ` : ''}${escapeHtml(t(path.edges.length === 1 ? 'route.jumps.one' : 'route.jumps.many', { count: path.edges.length }))}</span></div>
    <div class="route-totals">
      <div class="route-total"><span>${escapeHtml(t('route.totalDistance'))}</span><strong>${formatParsecs(totals.parsecs)}</strong></div>
      <div class="route-total"><span>${escapeHtml(t('route.totalTime', { class: formatClass(state.hyperdriveClass) }))}</span><strong>${formatTravelTime(totals.minHours, totals.maxHours)}</strong></div>
    </div>
    ${hasTransfers ? `<p class="route-warning">${escapeHtml(t('route.transferWarning'))}</p>` : ''}
    <div class="route-groups">${legs.map((leg, index) => {
      return `<div class="route-group ${leg.edge.kind === 'route' ? '' : 'auxiliary'}">
        <b>${index + 1}. ${escapeHtml(leg.a.name)} → ${escapeHtml(leg.b.name)}</b>
        <small>${escapeHtml(routeNameLabel(leg.edge.route))} · ${escapeHtml(travelProfileLabel(leg.profile))}</small>
        <div class="route-leg-metrics"><span>${formatParsecs(leg.parsecs)}</span><span>${formatLightYears(leg.lightYears)}</span><span>${formatTravelTime(leg.minHours, leg.maxHours)}</span></div>
      </div>`;
    }).join('')}</div>`;
  result.querySelectorAll('[data-route-option]').forEach((button) => button.addEventListener('click', () => {
    selectRouteAlternative(Number(button.dataset.routeOption));
  }));
  state.currentRoute = { itineraries, points, activeIndex: selectedIndex };
  state.highlightedPath = path;
  state.routeFrom = start;
  state.routeTo = end;
  if (refocus) fitPath(path.nodes);
  else requestDraw();
}

function selectRouteAlternative(index) {
  if (!state.currentRoute || index === state.currentRoute.activeIndex) return;
  renderRouteOptions(state.currentRoute.itineraries, state.currentRoute.points, index, true);
}

function calculateRoute() {
  const start = resolveInput($('#routeFrom'));
  const end = resolveInput($('#routeTo'));
  if (!start || !end) {
    showToast(t('route.validEndpoints'));
    return;
  }
  const waypointLocations = state.routeWaypoints.map((waypoint) => {
    const input = $(`#routeStopInput${waypoint.uid}`);
    const location = input ? resolveInput(input) : waypoint.location;
    waypoint.location = location;
    waypoint.value = input?.value || waypoint.value || '';
    return location;
  });
  if (waypointLocations.some((location) => !location)) {
    showToast(t('route.validStops'));
    return;
  }
  const points = [start, ...waypointLocations, end];
  if (points.length === 2 && start.id === end.id) {
    showToast(t('route.sameEndpoint'));
    return;
  }
  if (points.some((point, index) => index > 0 && point.id === points[index - 1].id)) {
    showToast(t('route.sameAdjacentPoint'));
    return;
  }
  state.routeFrom = start;
  state.routeTo = end;
  renderRouteOptions(kBestItineraries(points), points);
}

function waypointTarget(uid) {
  return `stop:${uid}`;
}

function waypointFromTarget(target) {
  if (!target?.startsWith('stop:')) return null;
  const uid = Number(target.slice(5));
  return state.routeWaypoints.find((waypoint) => waypoint.uid === uid) || null;
}

function routeTargetLabel(target) {
  if (target === 'from') return t('route.originA');
  if (target === 'to') return t('route.destinationB', { letter: routeLetter(state.routeWaypoints.length + 1) });
  const waypoint = waypointFromTarget(target);
  const index = state.routeWaypoints.indexOf(waypoint);
  return t('route.stopTarget', { number: index + 1, letter: routeLetter(index + 1) });
}

function nextRouteTarget(target) {
  const targets = ['from', ...state.routeWaypoints.map((waypoint) => waypointTarget(waypoint.uid)), 'to'];
  const index = targets.indexOf(target);
  return index >= 0 && index < targets.length - 1 ? targets[index + 1] : null;
}

function updateRouteEndpointLabels() {
  const destinationMarker = $('#routeToMarker');
  if (destinationMarker) destinationMarker.textContent = routeLetter(state.routeWaypoints.length + 1);
  const addButton = $('#addRouteStop');
  if (addButton) addButton.disabled = state.routeWaypoints.length >= MAX_ROUTE_STOPS;
  if (state.routePickTarget) {
    const endpoint = routeTargetLabel(state.routePickTarget);
    $('#routePickNote').textContent = t('route.pickActive', { endpoint });
    $('#mapHint').textContent = t('route.mapPickHint', { endpoint });
  }
}

function syncWaypointInputs() {
  state.routeWaypoints.forEach((waypoint) => {
    const input = $(`#routeStopInput${waypoint.uid}`);
    if (!input) return;
    waypoint.value = input.value;
    waypoint.location = resolveInput(input);
  });
}

function renderRouteStops() {
  const container = $('#routeStops');
  if (!container) return;
  container.innerHTML = state.routeWaypoints.map((waypoint, index) => {
    const number = index + 1;
    const target = waypointTarget(waypoint.uid);
    const value = waypoint.value || waypoint.location?.name || '';
    return `<div class="route-stop" data-waypoint-id="${waypoint.uid}">
      <div class="route-stop-heading">
        <button class="route-stop-drag" type="button" draggable="true" data-drag-stop="${waypoint.uid}" aria-label="${escapeHtml(t('route.dragStop', { number }))}" title="${escapeHtml(t('route.dragStop', { number }))}">⠿</button>
        <label class="field-label" for="routeStopInput${waypoint.uid}">${escapeHtml(t('route.stop', { number }))}</label>
        <div class="route-stop-controls">
          <button type="button" data-move-stop="${waypoint.uid}" data-direction="-1" aria-label="${escapeHtml(t('route.moveStopUp', { number }))}" title="${escapeHtml(t('route.moveStopUp', { number }))}" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" data-move-stop="${waypoint.uid}" data-direction="1" aria-label="${escapeHtml(t('route.moveStopDown', { number }))}" title="${escapeHtml(t('route.moveStopDown', { number }))}" ${index === state.routeWaypoints.length - 1 ? 'disabled' : ''}>↓</button>
          <button type="button" data-remove-stop="${waypoint.uid}" aria-label="${escapeHtml(t('route.removeStop', { number }))}" title="${escapeHtml(t('route.removeStop', { number }))}">×</button>
        </div>
      </div>
      <div class="search-wrap route-search waypoint-search ${state.routePickTarget === target ? 'pick-active' : ''}" data-route-target="${target}">
        <span class="route-marker stop">${routeLetter(index + 1)}</span>
        <input id="routeStopInput${waypoint.uid}" value="${escapeHtml(value)}" autocomplete="off" placeholder="${escapeHtml(t('route.stopPlaceholder'))}">
        <button class="map-pick-button" data-route-pick="${target}" type="button" aria-label="${escapeHtml(t('route.pickStop', { number }))}" title="${escapeHtml(t('route.pickOnMap'))}">⌖</button>
        <div class="suggestions" id="routeStopSuggestions${waypoint.uid}" role="listbox"></div>
      </div>
    </div>`;
  }).join('');

  state.routeWaypoints.forEach((waypoint) => {
    const target = waypointTarget(waypoint.uid);
    const input = $(`#routeStopInput${waypoint.uid}`);
    const suggestions = $(`#routeStopSuggestions${waypoint.uid}`);
    attachAutocomplete(input, suggestions, (location) => setRouteEndpoint(target, location));
    input.addEventListener('focus', () => setRoutePickTarget(target));
    input.addEventListener('input', () => {
      waypoint.value = input.value;
      waypoint.location = null;
      invalidateRoute();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') setTimeout(calculateRoute, 0);
    });
  });

  container.querySelectorAll('[data-route-pick]').forEach((button) => button.addEventListener('click', () => setRoutePickTarget(button.dataset.routePick, true)));
  container.querySelectorAll('[data-remove-stop]').forEach((button) => button.addEventListener('click', () => removeRouteStop(Number(button.dataset.removeStop))));
  container.querySelectorAll('[data-move-stop]').forEach((button) => button.addEventListener('click', () => moveRouteStop(Number(button.dataset.moveStop), Number(button.dataset.direction))));
  container.querySelectorAll('[data-drag-stop]').forEach((handle) => handle.addEventListener('dragstart', (event) => {
    syncWaypointInputs();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', handle.dataset.dragStop);
  }));
  container.querySelectorAll('[data-waypoint-id]').forEach((row) => {
    row.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (event) => {
      event.preventDefault();
      row.classList.remove('drag-over');
      reorderRouteStop(Number(event.dataTransfer.getData('text/plain')), Number(row.dataset.waypointId));
    });
  });
  updateRouteEndpointLabels();
}

function addRouteStop() {
  if (state.routeWaypoints.length >= MAX_ROUTE_STOPS) {
    showToast(t('route.maximumStops', { count: MAX_ROUTE_STOPS }));
    return;
  }
  syncWaypointInputs();
  const waypoint = { uid: state.nextWaypointId, location: null, value: '' };
  state.nextWaypointId += 1;
  state.routeWaypoints.push(waypoint);
  renderRouteStops();
  invalidateRoute();
  $(`#routeStopInput${waypoint.uid}`)?.focus();
}

function removeRouteStop(uid) {
  syncWaypointInputs();
  if (state.routePickTarget === waypointTarget(uid)) clearRoutePickTarget();
  state.routeWaypoints = state.routeWaypoints.filter((waypoint) => waypoint.uid !== uid);
  renderRouteStops();
  invalidateRoute();
}

function moveRouteStop(uid, direction) {
  syncWaypointInputs();
  const index = state.routeWaypoints.findIndex((waypoint) => waypoint.uid === uid);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= state.routeWaypoints.length) return;
  [state.routeWaypoints[index], state.routeWaypoints[nextIndex]] = [state.routeWaypoints[nextIndex], state.routeWaypoints[index]];
  renderRouteStops();
  invalidateRoute();
}

function reorderRouteStop(uid, targetUid) {
  if (uid === targetUid) return;
  syncWaypointInputs();
  const fromIndex = state.routeWaypoints.findIndex((waypoint) => waypoint.uid === uid);
  const originalTargetIndex = state.routeWaypoints.findIndex((waypoint) => waypoint.uid === targetUid);
  if (fromIndex < 0) return;
  const [waypoint] = state.routeWaypoints.splice(fromIndex, 1);
  const targetIndex = state.routeWaypoints.findIndex((item) => item.uid === targetUid);
  const insertIndex = fromIndex < originalTargetIndex ? targetIndex + 1 : targetIndex;
  state.routeWaypoints.splice(Math.max(0, insertIndex), 0, waypoint);
  renderRouteStops();
  invalidateRoute();
}

function setRoutePickTarget(kind, closePanel = false) {
  state.routePickTarget = kind;
  $$('.route-search').forEach((wrap) => wrap.classList.toggle('pick-active', wrap.dataset.routeTarget === kind));
  const label = routeTargetLabel(kind);
  const note = $('#routePickNote');
  note.textContent = t('route.pickActive', { endpoint: label });
  note.classList.add('active');
  $('#mapHint').textContent = t('route.mapPickHint', { endpoint: label });
  $('#mapHint').style.opacity = '1';
  if (closePanel && window.innerWidth <= 880) $('#sidebar').classList.remove('open');
  requestDraw();
}

function clearRoutePickTarget() {
  state.routePickTarget = null;
  $$('.route-search').forEach((wrap) => wrap.classList.remove('pick-active'));
  $('#routePickNote').textContent = t('route.pickNote');
  $('#routePickNote').classList.remove('active');
  $('#mapHint').textContent = t('map.hint');
  $('#mapHint').style.opacity = '0';
}

function invalidateRoute() {
  state.currentRoute = null;
  state.highlightedPath = null;
  $('#routeResult').classList.add('hidden');
  $('#routeResult').innerHTML = '';
  requestDraw();
}

function setRouteEndpoint(kind, location, fromMap = false) {
  const waypoint = waypointFromTarget(kind);
  const input = kind === 'from' ? $('#routeFrom') : kind === 'to' ? $('#routeTo') : $(`#routeStopInput${waypoint?.uid}`);
  if (!input) return;
  input.value = location.name;
  input.dataset.locationId = location.id;
  if (kind === 'from') state.routeFrom = location;
  else if (kind === 'to') state.routeTo = location;
  else {
    waypoint.location = location;
    waypoint.value = location.name;
  }
  invalidateRoute();
  if (fromMap) {
    const nextTarget = nextRouteTarget(kind);
    if (nextTarget) setRoutePickTarget(nextTarget);
    else clearRoutePickTarget();
    showToast(t('route.selectedPoint', { name: location.name, endpoint: routeTargetLabel(kind) }));
    if (!nextTarget && window.innerWidth <= 880) $('#sidebar').classList.add('open');
  } else {
    clearRoutePickTarget();
  }
  requestDraw();
}

function clearRoute() {
  for (const input of [$('#routeFrom'), $('#routeTo')]) {
    input.value = '';
    delete input.dataset.locationId;
  }
  state.routeFrom = null;
  state.routeWaypoints = [];
  state.routeTo = null;
  state.currentRoute = null;
  state.highlightedPath = null;
  state.selected = null;
  clearRoutePickTarget();
  $('#routeResult').classList.add('hidden');
  $('#routeResult').innerHTML = '';
  renderRouteStops();
  requestDraw();
}

function populateRegions() {
  const regions = [...new Set(state.locations.map((p) => p.region))].sort();
  const filter = $('#regionFilter');
  const selected = state.activeRegion;
  filter.innerHTML = `<option value="all">${escapeHtml(t('filters.allRegions'))}</option>${regions.map((region) => `<option value="${escapeHtml(region)}">${escapeHtml(regionLabel(region))}</option>`).join('')}`;
  filter.value = selected;
}

function updateFilterCount() {
  const count = state.locations.filter(isVisible).length;
  $('#filterCount').textContent = count === state.locations.length ? t('filters.all') : count.toLocaleString(localeCode());
}

function hitTest(screenX, screenY, includeFiltered = false) {
  if (!state.layerVisibility.planets) return null;
  const point = screenToMap(screenX, screenY);
  const threshold = 20 / state.view.scale;
  let best = null;
  let bestDistance = threshold;
  for (const location of state.locations) {
    if (!includeFiltered && !isVisible(location)) continue;
    for (const occurrence of locationOccurrences(location)) {
      const d = Math.hypot(occurrence.px - point.x, occurrence.py - point.y);
      if (d < bestDistance) {
        best = location;
        bestDistance = d;
      }
    }
  }
  return best;
}

function bindUI() {
  $$('.language-switch [data-locale]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.locale !== state.locale) applyLocale(button.dataset.locale);
  }));
  attachAutocomplete($('#planetSearch'), $('#searchSuggestions'), (location) => selectLocation(location));
  attachAutocomplete($('#routeFrom'), $('#fromSuggestions'), (location) => setRouteEndpoint('from', location));
  attachAutocomplete($('#routeTo'), $('#toSuggestions'), (location) => setRouteEndpoint('to', location));

  $('#clearSearch').addEventListener('click', () => {
    $('#planetSearch').value = '';
    delete $('#planetSearch').dataset.locationId;
    $('#planetSearch').focus();
  });

  $$('.mode-button').forEach((button) => button.addEventListener('click', () => {
    $$('.mode-button').forEach((item) => item.classList.toggle('active', item === button));
    const routeMode = button.dataset.mode === 'route';
    state.activeMode = routeMode ? 'route' : 'explore';
    $('#explorePanel').classList.toggle('hidden', routeMode);
    $('#routePanel').classList.toggle('hidden', !routeMode);
    $('#detailCard').classList.toggle('hidden', routeMode);
    if (!routeMode) clearRoutePickTarget();
    requestDraw();
  }));

  $$('#typeFilters .filter-chip').forEach((button) => button.addEventListener('click', () => {
    $$('#typeFilters .filter-chip').forEach((item) => item.classList.toggle('active', item === button));
    state.activeType = button.dataset.type;
    updateFilterCount();
    requestDraw();
  }));
  $('#regionFilter').addEventListener('change', (event) => {
    state.activeRegion = event.target.value;
    updateFilterCount();
    requestDraw();
  });
  $$('[data-map-layer]').forEach((input) => input.addEventListener('change', (event) => {
    state.layerVisibility[event.target.dataset.mapLayer] = event.target.checked;
    if (event.target.dataset.mapLayer === 'planets' && !event.target.checked) {
      state.hovered = null;
      $('#mapTooltip').classList.remove('show');
    }
    requestDraw();
  }));

  $('#goCoords').addEventListener('click', () => {
    const x = Number($('#coordX').value);
    const y = Number($('#coordY').value);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > MAP_SIZE || y > MAP_SIZE) {
      showToast(t('coords.invalid'));
      return;
    }
    state.selected = null;
    state.coordinateTarget = { x, y };
    focusPoint(x, y, 0.6);
  });

  $('#swapRoute').addEventListener('click', () => {
    syncWaypointInputs();
    const from = $('#routeFrom');
    const to = $('#routeTo');
    [from.value, to.value] = [to.value, from.value];
    const fromId = from.dataset.locationId;
    const toId = to.dataset.locationId;
    if (toId) from.dataset.locationId = toId;
    else delete from.dataset.locationId;
    if (fromId) to.dataset.locationId = fromId;
    else delete to.dataset.locationId;
    [state.routeFrom, state.routeTo] = [state.routeTo, state.routeFrom];
    state.routeWaypoints.reverse();
    renderRouteStops();
    invalidateRoute();
  });
  $('#addRouteStop').addEventListener('click', addRouteStop);
  $('#calculateRoute').addEventListener('click', calculateRoute);
  $('#clearRoute').addEventListener('click', clearRoute);
  $('#routeFrom').addEventListener('focus', () => setRoutePickTarget('from'));
  $('#routeTo').addEventListener('focus', () => setRoutePickTarget('to'));
  $('#routeFrom').addEventListener('input', () => { state.routeFrom = null; invalidateRoute(); });
  $('#routeTo').addEventListener('input', () => { state.routeTo = null; invalidateRoute(); });
  $$('[data-route-pick]').forEach((button) => button.addEventListener('click', () => setRoutePickTarget(button.dataset.routePick, true)));
  $('#hyperdriveClass').addEventListener('input', (event) => {
    state.hyperdriveClass = Number(event.target.value);
    $('#hyperdriveValue').textContent = t('route.class', { value: formatClass(state.hyperdriveClass) });
    if (state.currentRoute) renderRouteOptions(state.currentRoute.itineraries, state.currentRoute.points, state.currentRoute.activeIndex, false);
  });
  $('#routeFrom').addEventListener('keydown', (event) => { if (event.key === 'Enter') setTimeout(calculateRoute, 0); });
  $('#routeTo').addEventListener('keydown', (event) => { if (event.key === 'Enter') setTimeout(calculateRoute, 0); });

  $('#zoomIn').addEventListener('click', () => zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.35));
  $('#zoomOut').addEventListener('click', () => zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1 / 1.35));
  $('#fitMap').addEventListener('click', fitMap);

  $('#aboutButton').addEventListener('click', () => $('#aboutDialog').showModal());
  $('#closeAbout').addEventListener('click', () => $('#aboutDialog').close());
  $('#aboutDialog').addEventListener('click', (event) => { if (event.target === $('#aboutDialog')) $('#aboutDialog').close(); });
  $('#closeWiki').addEventListener('click', () => $('#wikiDialog').close());
  $('#wikiDialog').addEventListener('click', (event) => { if (event.target === $('#wikiDialog')) $('#wikiDialog').close(); });
  $('#wikiDialog').addEventListener('close', () => {
    state.currentWikiLocation = null;
    state.wikiRequestId += 1;
  });

  $('#mobilePanelButton').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') $('#sidebar').classList.remove('open');
  });

  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    zoomAt(event.clientX - rect.left, event.clientY - rect.top, event.deltaY < 0 ? 1.14 : 1 / 1.14);
  }, { passive: false });

  canvas.addEventListener('pointerdown', (event) => {
    state.dragging = true;
    state.moved = false;
    state.pointer = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('dragging');
    $('#mapHint').style.opacity = '0';
  });
  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const map = screenToMap(event.clientX - rect.left, event.clientY - rect.top);
    $('#coordinateReadout').textContent = map.x >= 0 && map.y >= 0 && map.x <= MAP_SIZE && map.y <= MAP_SIZE ? `px ${Math.round(map.x)}, ${Math.round(map.y)}` : t('map.outside');
    if (state.dragging) {
      state.hovered = null;
      $('#mapTooltip').classList.remove('show');
      const dx = event.clientX - state.pointer.x;
      const dy = event.clientY - state.pointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true;
      state.view.x += dx;
      state.view.y += dy;
      state.pointer = { x: event.clientX, y: event.clientY };
      requestDraw();
    } else {
      const hovered = hitTest(event.clientX - rect.left, event.clientY - rect.top, Boolean(state.routePickTarget));
      if (hovered?.id !== state.hovered?.id) {
        state.hovered = hovered;
        requestDraw();
      }
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
      const tooltip = $('#mapTooltip');
      if (hovered) {
        tooltip.innerHTML = `<strong>${escapeHtml(hovered.name)}</strong><span>${escapeHtml(regionLabel(hovered.region))} · ${Math.round(hovered.px)}, ${Math.round(hovered.py)} px</span>`;
        tooltip.style.left = `${Math.max(8, Math.min(rect.width - 190, event.clientX - rect.left + 15))}px`;
        tooltip.style.top = `${Math.max(8, Math.min(rect.height - 58, event.clientY - rect.top + 15))}px`;
        tooltip.classList.add('show');
      } else {
        tooltip.classList.remove('show');
      }
    }
  });
  canvas.addEventListener('pointerleave', () => {
    state.hovered = null;
    $('#mapTooltip').classList.remove('show');
    requestDraw();
  });
  canvas.addEventListener('pointerup', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (!state.moved) {
      const location = hitTest(event.clientX - rect.left, event.clientY - rect.top, Boolean(state.routePickTarget));
      if (location && state.routePickTarget) setRouteEndpoint(state.routePickTarget, location, true);
      else if (location && state.activeMode === 'explore') selectLocation(location, false);
    }
    state.dragging = false;
    canvas.classList.remove('dragging');
    canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointercancel', () => {
    state.dragging = false;
    canvas.classList.remove('dragging');
  });

  window.addEventListener('resize', () => {
    const wasFit = Math.abs(state.view.scale - state.fitScale) < .01;
    resizeCanvas();
    if (wasFit) fitMap();
  });
}

async function boot() {
  applyLocale(state.locale, false);
  try {
    const [response] = await Promise.all([
      fetch('./data/map-data.json'),
      ...backgroundLayerOrder.map((key) => backgroundLayerImages[key].decode())
    ]);
    if (!response.ok) throw new Error(`Error de catálogo: ${response.status}`);
    state.data = await response.json();
    state.locations = state.data.locations;
    state.byId = new Map(state.locations.map((location) => [location.id, location]));
    state.adjacency = Array.from({ length: state.locations.length }, () => []);
    state.data.edges.forEach((edge, edgeIndex) => {
      state.adjacency[edge.a].push({ to: edge.b, edgeIndex });
      state.adjacency[edge.b].push({ to: edge.a, edgeIndex });
    });
    state.imageReady = true;
    bindUI();
    resizeCanvas();
    applyLocale(state.locale, false);
    setTimeout(() => { if (!state.routePickTarget) $('#mapHint').style.opacity = '0'; }, 6200);
  } catch (error) {
    console.error(error);
    $('#catalogStatus').textContent = t('status.error');
    showToast(t('status.loadError'));
  }
}

boot();
