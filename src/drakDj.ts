import { DoublyLinkedList } from './DoublyLinkedList';
import { SongNode } from './Node';
import './style.css';

interface TrackDetails {
  album: string;
  artworkUrl: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  mediaKey?: string;
}

interface SeedTrack {
  title: string;
  artist: string;
  genre: string;
  albumId: string;
  file: string;
  licenseName: string;
  licenseUrl: string;
}

interface PlaylistEntry {
  id: string;
  name: string;
  list: DoublyLinkedList;
}

interface SavedTrack {
  title: string;
  artist: string;
  genre: string;
  duration: number;
  audioUrl: string;
  details: TrackDetails;
}

interface SavedPlaylist {
  id: string;
  name: string;
  currentIndex: number;
  tracks: SavedTrack[];
}

interface SavedLibrary {
  activePlaylistId: string;
  playlists: SavedPlaylist[];
}

interface StoredMedia {
  id: string;
  blob: Blob;
}

const STATE_KEY = 'drak-dj.library.v1';
const THEME_KEY = 'drak-dj.theme';
const DB_NAME = 'drak-dj-media';
const MEDIA_STORE = 'audio-files';
const playlists = new Map<string, PlaylistEntry>();
const trackDetails = new Map<string, TrackDetails>();
const mediaObjectUrls = new Set<string>();
let activePlaylistId = '';
let dbPromise: Promise<IDBDatabase> | null = null;
let pointerDrag: { id: string; startX: number; startY: number; active: boolean } | null = null;

const genreSuggestions = ['Reguetón', 'Pop', 'Electrónica', 'Rock', 'Hip-hop / Funk', 'Indie / Electrónica', 'Jazz', 'Clásica', 'Salsa', 'Reggae', 'Blues', 'Folk'];

function buildLocalCoverDataUrl(title: string, genre: string): string {
  const initials = (title || 'DJ').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'DJ';
  const palette: Record<string, string[]> = {
    rock: ['#1b2432', '#ff8a5b'],
    pop: ['#2f1b4e', '#ff5ec4'],
    electronic: ['#0f2d2c', '#57d1b9'],
    jazz: ['#2d2c2f', '#f6c453'],
    classical: ['#1f2940', '#7aa2ff'],
    latin: ['#2f1f1b', '#ff9a3d'],
    reggae: ['#182a1b', '#7fe37e'],
    indie: ['#2d1f31', '#c18cff'],
    blues: ['#1a2a38', '#75b4ff'],
    reggaeton: ['#2b2d52', '#ff7aa2'],
    other: ['#1a1d24', '#8ad7d7']
  };
  const colors = palette[genreTheme(genre)] ?? palette.other;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${colors[0]}"/>
          <stop offset="100%" stop-color="${colors[1]}"/>
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#g)"/>
      <circle cx="150" cy="110" r="82" fill="rgba(255,255,255,0.08)"/>
      <text x="50%" y="53%" fill="white" font-size="72" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle">${initials}</text>
      <text x="50%" y="78%" fill="rgba(255,255,255,0.9)" font-size="18" font-family="Arial, sans-serif" letter-spacing="3" text-anchor="middle">${genre.toUpperCase()}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildLocalAudioUrl(): string {
  const sampleRate = 22050;
  const totalSamples = sampleRate;
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < totalSamples; i += 1) {
    view.setInt16(offset, 0, true);
    offset += 2;
  }

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

const seeds: SeedTrack[] = [
  { title: 'Nothing Like Captain Crunch', artist: 'Broke For Free', genre: 'Hip-hop / Funk', albumId: 'Slam_Funk-7603', file: 'Broke_For_Free_-_01_-_Nothing_Like_Captain_Crunch.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'The Great', artist: 'Broke For Free', genre: 'Hip-hop / Funk', albumId: 'Slam_Funk-7603', file: 'Broke_For_Free_-_03_-_The_Great.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Caught In The Beat', artist: 'Broke For Free', genre: 'Electrónica / Funk', albumId: 'Slam_Funk-7603', file: 'Broke_For_Free_-_04_-_Caught_In_The_Beat.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Hella', artist: 'Broke For Free', genre: 'Hip-hop / Funk', albumId: 'Slam_Funk-7603', file: 'Broke_For_Free_-_05_-_Hella.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'High School Snaps', artist: 'Broke For Free', genre: 'Hip-hop / Funk', albumId: 'Slam_Funk-7603', file: 'Broke_For_Free_-_06_-_High_School_Snaps.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Night Owl', artist: 'Broke For Free', genre: 'Indie / Electrónica', albumId: 'Directionless_EP-8295', file: 'Broke_For_Free_-_01_-_Night_Owl.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'My Always Mood', artist: 'Broke For Free', genre: 'Indie / Electrónica', albumId: 'Directionless_EP-8295', file: 'Broke_For_Free_-_02_-_My_Always_Mood.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Day Bird', artist: 'Broke For Free', genre: 'Indie / Electrónica', albumId: 'Directionless_EP-8295', file: 'Broke_For_Free_-_03_-_Day_Bird.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Mells Parade', artist: 'Broke For Free', genre: 'Indie / Electrónica', albumId: 'Directionless_EP-8295', file: 'Broke_For_Free_-_05_-_Mells_Parade.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Acid Jazz', artist: 'Kevin MacLeod', genre: 'Jazz', albumId: 'Jazz_Sampler-9619', file: 'Kevin_MacLeod_-_AcidJazz.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Acid Trumpet', artist: 'Kevin MacLeod', genre: 'Jazz', albumId: 'Jazz_Sampler-9619', file: 'Kevin_MacLeod_-_Acid_Trumpet.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'As I Figure', artist: 'Kevin MacLeod', genre: 'Jazz', albumId: 'Jazz_Sampler-9619', file: 'Kevin_MacLeod_-_As_I_Figure.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Canon in D Major', artist: 'Kevin MacLeod', genre: 'Clásica', albumId: 'Classical_Sampler-9615', file: 'Kevin_MacLeod_-_Canon_in_D_Major.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Brandenburg Concerto No. 4', artist: 'Kevin MacLeod', genre: 'Clásica', albumId: 'Classical_Sampler-9615', file: 'Kevin_MacLeod_-_Brandenburg_Concerto_No4-1_BWV1049.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Dance of the Sugar Plum Fairy', artist: 'Kevin MacLeod', genre: 'Clásica', albumId: 'Classical_Sampler-9615', file: 'Kevin_MacLeod_-_Dance_of_the_Sugar_Plum_Fairy.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Rock n roll, parte I', artist: 'La Mugre Roja', genre: 'Rock', albumId: '20110721224709348-9605', file: 'La_Mugre_Roja_-_rock_n_roll_parte_I.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'Rock n roll, parte II', artist: 'La Mugre Roja', genre: 'Rock', albumId: '20110721224709348-9605', file: 'La_Mugre_Roja_-_rock_n_roll_parte_II.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'Rock n roll, parte III', artist: 'La Mugre Roja', genre: 'Rock', albumId: '20110721224709348-9605', file: 'La_Mugre_Roja_-_rock_n_roll_parte_III.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'Dune', artist: 'Jahzzar', genre: 'Indie / Electrónica', albumId: 'jamendo-116889', file: '01-993747-Jahzzar-Dune.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'Revolver', artist: 'Jahzzar', genre: 'Indie / Electrónica', albumId: 'jamendo-116889', file: '03-993701-Jahzzar-Revolver.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'PopStar', artist: 'Audionautix', genre: 'Pop', albumId: 'audionautix-music-collection', file: 'PopStar.mp3', licenseName: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { title: 'Hot Salsa Trip', artist: 'Arsonist', genre: 'Salsa', albumId: 'hot_salsa_trip-8727', file: 'arsonist_-_01_-_Hot_salsa_trip.mp3', licenseName: 'CC BY-NC-ND 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/3.0/' },
  { title: 'Jahnoy', artist: 'Med Dred', genre: 'Reggae', albumId: 'Dred_Reggae-18488', file: 'Med_Dred_-_01_-_Jahnoy.mp3', licenseName: 'CC BY-NC-ND 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/' }
];

function id(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function norm(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function applyTheme(theme: 'dark' | 'light', persist = true): void {
  document.documentElement.dataset.theme = theme;
  const button = document.getElementById('theme-toggle') as HTMLButtonElement | null;
  if (button) {
    const isDark = theme === 'dark';
    button.textContent = isDark ? '☼' : '☾';
    button.setAttribute('aria-label', isDark ? 'Activar modo claro' : 'Activar modo oscuro');
    button.title = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
  }
  if (persist) localStorage.setItem(THEME_KEY, theme);
}

function genreTheme(genre: string): string {
  const value = norm(genre);
  if (value.includes('reggaeton') || value.includes('regueton')) return 'reggaeton';
  if (value.includes('pop')) return 'pop';
  if (value.includes('electronic')) return 'electronic';
  if (value.includes('rock')) return 'rock';
  if (value.includes('jazz')) return 'jazz';
  if (value.includes('clasica') || value.includes('classical')) return 'classical';
  if (value.includes('latin') || value.includes('salsa')) return 'latin';
  if (value.includes('reggae')) return 'reggae';
  if (value.includes('folk') || value.includes('indie')) return 'indie';
  if (value.includes('blues')) return 'blues';
  return 'other';
}

function timeText(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

function getPlaylist(): PlaylistEntry | null {
  return playlists.get(activePlaylistId) ?? null;
}

function getList(): DoublyLinkedList | null {
  return getPlaylist()?.list ?? null;
}

function findTrack(trackId: string, list = getList()): SongNode | null {
  let node = list?.head ?? null;
  while (node) {
    if (node.id === trackId) return node;
    node = node.next;
  }
  return null;
}

function emptyDetails(): TrackDetails {
  return { album: '', artworkUrl: '', sourceUrl: '', licenseName: '', licenseUrl: '' };
}

function db(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(MEDIA_STORE)) request.result.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB no disponible'));
  });
  return dbPromise;
}

async function putMedia(mediaId: string, blob: Blob): Promise<void> {
  const database = await db();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(MEDIA_STORE, 'readwrite');
    transaction.objectStore(MEDIA_STORE).put({ id: mediaId, blob } satisfies StoredMedia);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('No se pudo guardar el MP3'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Se canceló el guardado del MP3'));
  });
}

async function getMedia(mediaId: string): Promise<Blob | null> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const request = database.transaction(MEDIA_STORE, 'readonly').objectStore(MEDIA_STORE).get(mediaId);
    request.onsuccess = () => resolve((request.result as StoredMedia | undefined)?.blob ?? null);
    request.onerror = () => reject(request.error ?? new Error('No se pudo leer el MP3'));
  });
}

function createSeedPlaylist(): PlaylistEntry {
  const list = new DoublyLinkedList();
  const localAudio = buildLocalAudioUrl();
  mediaObjectUrls.add(localAudio);

  for (const seed of seeds) {
    const node = list.addAtEnd(seed.title, seed.artist, seed.genre, 0, localAudio);
    trackDetails.set(node.id, {
      album: seed.albumId,
      artworkUrl: buildLocalCoverDataUrl(seed.title, seed.genre),
      sourceUrl: `https://archive.org/details/${seed.albumId}`,
      licenseName: seed.licenseName,
      licenseUrl: seed.licenseUrl
    });
  }
  list.current = list.head;
  return { id: id(), name: 'Mi música', list };
}

function serialisePlaylist(entry: PlaylistEntry): SavedPlaylist {
  const savedTracks: SavedTrack[] = [];
  let node = entry.list.head;
  let position = 0;
  let currentIndex = 0;
  while (node) {
    const details = trackDetails.get(node.id) ?? emptyDetails();
    if (node === entry.list.current) currentIndex = position;
    savedTracks.push({
      title: node.title,
      artist: node.artist,
      genre: node.genre,
      duration: node.duration,
      audioUrl: details.mediaKey ? '' : node.audioUrl,
      details
    });
    position += 1;
    node = node.next;
  }
  return { id: entry.id, name: entry.name, currentIndex, tracks: savedTracks };
}

function saveLibrary(): void {
  try {
    const data: SavedLibrary = { activePlaylistId, playlists: Array.from(playlists.values(), serialisePlaylist) };
    localStorage.setItem(STATE_KEY, JSON.stringify(data));
  } catch {
    setStatus('No se pudieron guardar los cambios en este navegador.');
  }
}

async function restoreLibrary(): Promise<void> {
  const raw = localStorage.getItem(STATE_KEY);
  if (raw) {
    try {
      const saved = JSON.parse(raw) as SavedLibrary;
      for (const savedPlaylist of saved.playlists) {
        const list = new DoublyLinkedList();
        const nodes: SongNode[] = [];
        for (const track of savedPlaylist.tracks) {
          let audioUrl = track.audioUrl;
          if (track.details.mediaKey) {
            const blob = await getMedia(track.details.mediaKey);
            if (!blob) continue;
            audioUrl = URL.createObjectURL(blob);
            mediaObjectUrls.add(audioUrl);
          }
          const node = list.addAtEnd(track.title, track.artist, track.genre, track.duration, audioUrl);
          trackDetails.set(node.id, track.details);
          nodes.push(node);
        }
        list.current = nodes[Math.min(savedPlaylist.currentIndex, nodes.length - 1)] ?? list.head;
        playlists.set(savedPlaylist.id, { id: savedPlaylist.id, name: savedPlaylist.name, list });
      }
      if (playlists.size) {
        activePlaylistId = playlists.has(saved.activePlaylistId) ? saved.activePlaylistId : playlists.keys().next().value as string;
        return;
      }
    } catch (error) {
      console.error('No se pudo restaurar la biblioteca:', error);
    }
  }
  const initial = createSeedPlaylist();
  playlists.set(initial.id, initial);
  activePlaylistId = initial.id;
  saveLibrary();
}

function renderShell(): void {
  const root = document.getElementById('app') || document.body;
  root.innerHTML = `
    <main class="studio-shell">
      <header class="studio-header">
        <a class="brand-mark" href="#player" aria-label="drak-dj, inicio">d<span>.</span></a>
        <div class="header-copy"><p>drak-dj</p><span>Tu música, a tu manera</span></div>
        <div class="header-actions">
          <label class="playlist-picker" for="playlist-select"><span>PLAYLIST</span><select id="playlist-select" aria-label="Playlist activa"></select></label>
          <form class="create-playlist-form" id="create-playlist-form"><label class="visually-hidden" for="new-playlist-name">Nombre de nueva playlist</label><input id="new-playlist-name" type="text" maxlength="40" placeholder="Nueva playlist" required><button type="submit" aria-label="Crear playlist" title="Crear playlist">+</button></form>
          <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Activar modo claro" title="Activar modo claro">☼</button>
        </div>
      </header>

      <div class="studio-layout">
        <section class="player-stage" id="player" aria-label="Reproductor de música">
          <p class="section-kicker">EN REPRODUCCIÓN</p>
          <div class="album-art-wrap" id="album-art-wrap" data-genre="other"><img id="album-art" class="album-art" alt="Portada del álbum"><div id="art-fallback" class="art-fallback" aria-hidden="true"><span id="art-initials">DJ</span><small id="art-genre-label">TU MÚSICA</small></div></div>
          <div class="track-heading"><div class="track-copy"><h1 id="track-title">Selecciona una canción</h1><p id="track-artist">Tu biblioteca</p></div><span class="playing-mark" id="playing-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>
          <p class="track-credit" id="track-credit"></p>
          <audio id="audio-player" preload="metadata"></audio>
          <div class="timeline"><time id="current-time">0:00</time><input id="seek-slider" class="seek-slider" type="range" min="0" max="0" step="0.1" value="0" aria-label="Posición de reproducción" disabled><time id="duration-time">--:--</time></div>
          <div class="transport-controls" aria-label="Controles del reproductor"><button id="prev-btn" class="transport-button" type="button" aria-label="Canción anterior" title="Canción anterior">|‹</button><button id="play-btn" class="play-button" type="button" aria-label="Reproducir" title="Reproducir">▶</button><button id="next-btn" class="transport-button" type="button" aria-label="Canción siguiente" title="Canción siguiente">›|</button></div>
          <div class="player-footer"><label class="volume-control" for="volume-slider"><span aria-hidden="true">◖</span><input id="volume-slider" type="range" min="0" max="1" step="0.01" value="0.8" aria-label="Volumen"></label><p id="playback-status" aria-live="polite">Listo para reproducir</p><label class="speed-control" for="speed-select"><span>VELOCIDAD</span><select id="speed-select" aria-label="Velocidad de reproducción"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label></div>
        </section>

        <aside class="queue-panel" aria-labelledby="queue-title">
          <div class="queue-heading"><div><p class="section-kicker" id="playlist-kicker">TU SESIÓN</p><h2 id="queue-title">Cola de reproducción</h2></div><span class="queue-count" id="queue-count">0 pistas</span></div>
          <details class="upload-panel" id="upload-panel"><summary><span class="upload-plus">+</span><span>Añadir canciones MP3</span></summary><form class="upload-form" id="upload-form"><label for="upload-title">Título</label><input id="upload-title" name="title" type="text" maxlength="100" required><label for="upload-artist">Artista</label><input id="upload-artist" name="artist" type="text" maxlength="100" required><label for="upload-genre">Género</label><input id="upload-genre" name="genre" type="text" list="genre-suggestions" maxlength="40" placeholder="Ej. Reguetón" required><datalist id="genre-suggestions"></datalist><label for="upload-file">Archivo MP3</label><input id="upload-file" name="file" type="file" accept=".mp3,audio/mpeg,audio/mp3,audio/x-mp3" required><button class="upload-submit" type="submit">Añadir a esta playlist</button><p class="upload-note">El archivo se guarda en este navegador y no se sube a internet.</p></form></details>
          <div class="queue-tools"><label class="search-box" for="track-search"><span class="search-icon" aria-hidden="true"></span><input id="track-search" type="search" placeholder="Buscar en esta playlist" autocomplete="off" aria-label="Buscar canción, artista o género"></label><select id="genre-filter" aria-label="Filtrar por género"><option value="">Todos los géneros</option></select></div>
          <div class="queue-columns" aria-hidden="true"><span>#</span><span>CANCIÓN</span><span>TIEMPO</span><span>ORDEN</span></div><ol class="song-list" id="song-list"></ol><p class="empty-results" id="empty-results" hidden>Esta playlist no tiene canciones.</p><p class="queue-hint">Arrastra para ordenar o usa ↑ ↓. Las playlists se guardan en este navegador.</p>
        </aside>
      </div>
      <footer class="studio-footer">drak-dj · Reproductor local</footer>
    </main>`;

  applyTheme(localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark', false);
  setupListeners();
}

function updatePlayer(autoplay = false): void {
  const entry = getPlaylist();
  const current = entry?.list.getCurrent() ?? null;
  const audio = document.getElementById('audio-player') as HTMLAudioElement;
  const artwork = document.getElementById('album-art') as HTMLImageElement;
  const coverWrap = document.getElementById('album-art-wrap')!;

  if (!entry || !current) {
    document.getElementById('track-title')!.textContent = 'Tu playlist está vacía';
    document.getElementById('track-artist')!.textContent = 'Añade un MP3 para empezar';
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    artwork.removeAttribute('src');
    artwork.classList.remove('is-loaded');
    coverWrap.classList.remove('has-image');
    coverWrap.dataset.genre = 'other';
    document.getElementById('art-initials')!.textContent = 'DJ';
    document.getElementById('art-genre-label')!.textContent = 'TU PLAYLIST';
    document.getElementById('track-credit')!.replaceChildren();
    document.getElementById('playlist-kicker')!.textContent = entry?.name.toUpperCase() ?? 'TU SESIÓN';
    resetProgress();
    renderQueue();
    return;
  }

  const details = trackDetails.get(current.id) ?? emptyDetails();
  document.getElementById('track-title')!.textContent = current.title;
  document.getElementById('track-artist')!.textContent = `${current.artist} · ${current.genre}${details.album ? ` · ${details.album.replaceAll('_', ' ')}` : ''}`;
  document.getElementById('playlist-kicker')!.textContent = entry.name.toUpperCase();
  coverWrap.dataset.genre = genreTheme(current.genre);
  document.getElementById('art-initials')!.textContent = current.title.slice(0, 2).toUpperCase();
  document.getElementById('art-genre-label')!.textContent = current.genre.toUpperCase();

  if (details.artworkUrl) {
    if (artwork.src !== details.artworkUrl) artwork.src = details.artworkUrl;
    artwork.alt = `Portada del álbum ${details.album.replaceAll('_', ' ')}`;
    coverWrap.classList.toggle('has-image', artwork.classList.contains('is-loaded'));
  } else {
    artwork.removeAttribute('src');
    artwork.classList.remove('is-loaded');
    coverWrap.classList.remove('has-image');
  }
  renderCredit(details);
  if (audio.getAttribute('src') !== current.audioUrl) {
    audio.src = current.audioUrl;
    audio.load();
    resetProgress();
  }
  renderQueue();
  saveLibrary();
  if (autoplay) void playCurrent();
}

function renderCredit(details: TrackDetails): void {
  const credit = document.getElementById('track-credit')!;
  credit.replaceChildren();
  if (details.mediaKey) {
    credit.textContent = 'Archivo MP3 privado · guardado en este navegador';
    return;
  }
  if (details.sourceUrl) {
    const source = document.createElement('a');
    source.href = details.sourceUrl;
    source.target = '_blank';
    source.rel = 'noreferrer';
    source.textContent = 'Fuente y álbum';
    credit.appendChild(source);
  }
  if (details.licenseName && details.licenseUrl) {
    if (credit.childNodes.length) credit.appendChild(document.createTextNode(' · '));
    const license = document.createElement('a');
    license.href = details.licenseUrl;
    license.target = '_blank';
    license.rel = 'noreferrer';
    license.textContent = details.licenseName;
    credit.appendChild(license);
  }
}

function resetProgress(): void {
  const seek = document.getElementById('seek-slider') as HTMLInputElement;
  seek.value = '0'; seek.max = '0'; seek.disabled = true; seek.style.setProperty('--progress', '0%');
  document.getElementById('current-time')!.textContent = '0:00';
  document.getElementById('duration-time')!.textContent = '--:--';
  setStatus('Cargando canción…');
}

function setStatus(message: string): void {
  const status = document.getElementById('playback-status');
  if (status) status.textContent = message;
}

function setPlayingState(playing: boolean): void {
  const button = document.getElementById('play-btn') as HTMLButtonElement | null;
  if (!button) return;
  button.textContent = playing ? 'Ⅱ' : '▶';
  button.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
  button.title = playing ? 'Pausar' : 'Reproducir';
  document.getElementById('playing-mark')?.classList.toggle('is-playing', playing);
  setStatus(playing ? 'En reproducción' : 'En pausa');
}

async function playCurrent(): Promise<void> {
  try { await (document.getElementById('audio-player') as HTMLAudioElement).play(); }
  catch { setStatus('No se pudo cargar el audio. Revisa tu conexión o el archivo.'); setPlayingState(false); }
}

function stepTrack(direction: -1 | 1): void {
  const list = getList();
  const current = list?.getCurrent();
  if (!list || !current) return;
  const next = direction === 1 ? current.next ?? list.head : current.prev ?? list.tail;
  if (!next) return;
  list.current = next;
  updatePlayer(true);
}

function moveBefore(list: DoublyLinkedList, moving: SongNode, target: SongNode): void {
  if (moving === target || moving.next === target) return;
  if (moving.prev) moving.prev.next = moving.next; else list.head = moving.next;
  if (moving.next) moving.next.prev = moving.prev; else list.tail = moving.prev;
  moving.prev = target.prev;
  moving.next = target;
  if (target.prev) target.prev.next = moving; else list.head = moving;
  target.prev = moving;
}

function moveAfter(list: DoublyLinkedList, moving: SongNode, target: SongNode): void {
  if (moving === target || target.next === moving) return;
  if (moving.prev) moving.prev.next = moving.next; else list.head = moving.next;
  if (moving.next) moving.next.prev = moving.prev; else list.tail = moving.prev;
  moving.prev = target;
  moving.next = target.next;
  if (target.next) target.next.prev = moving; else list.tail = moving;
  target.next = moving;
}

function moveTrack(trackId: string, direction: -1 | 1): void {
  const list = getList();
  const moving = findTrack(trackId, list);
  if (!list || !moving) return;
  const target = direction === -1 ? moving.prev : moving.next;
  if (!target) return;
  if (direction === -1) moveBefore(list, moving, target); else moveBefore(list, target, moving);
  renderQueue();
  saveLibrary();
}

function removeTrack(trackId: string): void {
  const list = getList();
  const node = findTrack(trackId, list);
  if (!list || !node) return;

  const next = node.next ?? node.prev;
  if (node.prev) node.prev.next = node.next; else list.head = node.next;
  if (node.next) node.next.prev = node.prev; else list.tail = node.prev;

  if (list.current === node) {
    list.current = next ?? null;
  }

  trackDetails.delete(node.id);
  renderQueue();
  updatePlayer();
  saveLibrary();
  setStatus(`Se eliminó «${node.title}» de la cola.`);
}

function renderQueue(): void {
  const element = document.getElementById('song-list') as HTMLOListElement | null;
  const entry = getPlaylist();
  if (!element || !entry) return;
  const search = norm((document.getElementById('track-search') as HTMLInputElement).value.trim());
  const selectedGenre = (document.getElementById('genre-filter') as HTMLSelectElement).value;
  const emptyMessage = document.getElementById('empty-results')!;
  element.replaceChildren();
  let node = entry.list.head;
  let index = 1;
  let visible = 0;

  while (node) {
    const next = node.next;
    const details = trackDetails.get(node.id) ?? emptyDetails();
    if (norm(`${node.title} ${node.artist} ${node.genre}`).includes(search) && (!selectedGenre || node.genre === selectedGenre)) {
      const item = document.createElement('li');
      item.className = `queue-item${node === entry.list.current ? ' active' : ''}`;
      item.dataset.trackId = node.id;

      const handle = document.createElement('button');
      handle.className = 'queue-index queue-drag-handle';
      handle.type = 'button';
      handle.title = 'Arrastrar para ordenar';
      handle.setAttribute('aria-label', `Arrastrar ${node.title} para reordenar`);
      handle.textContent = index.toString().padStart(2, '0');

      const select = document.createElement('button');
      select.className = 'queue-select';
      select.type = 'button';
      select.dataset.action = 'select';
      select.setAttribute('aria-label', `Reproducir ${node.title}`);
      let cover: HTMLElement;
      if (details.artworkUrl) {
        const image = document.createElement('img');
        image.className = 'queue-cover';
        image.src = details.artworkUrl;
        image.alt = '';
        image.loading = 'lazy';
        cover = image;
      } else {
        const generated = document.createElement('span');
        generated.className = 'queue-cover generated-cover';
        generated.dataset.genre = genreTheme(node.genre);
        generated.textContent = node.title.slice(0, 1).toUpperCase();
        generated.setAttribute('aria-hidden', 'true');
        cover = generated;
      }

      const info = document.createElement('span');
      info.className = 'queue-song-info';
      const title = document.createElement('strong');
      title.textContent = node.title;
      const artist = document.createElement('span');
      artist.textContent = `${node.artist} · ${node.genre}`;
      info.append(title, artist);
      select.append(cover, info);

      const duration = document.createElement('time');
      duration.className = 'queue-duration';
      duration.textContent = node.duration > 0 ? timeText(node.duration) : '--:--';

      const controls = document.createElement('span');
      controls.className = 'reorder-controls';
      for (const [action, glyph, label, disabled] of [
        ['up', '↑', 'arriba', !node.prev],
        ['down', '↓', 'abajo', !node.next]
      ] as const) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.action = action;
        button.textContent = glyph;
        button.title = `Mover ${label}`;
        button.setAttribute('aria-label', `Mover ${node.title} ${label}`);
        button.disabled = disabled;
        controls.appendChild(button);
      }

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'queue-remove';
      removeButton.dataset.action = 'remove';
      removeButton.textContent = '✕';
      removeButton.title = 'Quitar de la cola';
      removeButton.setAttribute('aria-label', `Quitar ${node.title} de la cola`);
      controls.appendChild(removeButton);

      item.append(handle, select, duration, controls);
      element.appendChild(item);
      visible += 1;
    }
    node = next;
    index += 1;
  }

  document.getElementById('queue-count')!.textContent = `${index - 1} pistas`;
  emptyMessage.hidden = visible > 0;
}

function renderPlaylists(): void {
  const select = document.getElementById('playlist-select') as HTMLSelectElement;
  select.replaceChildren();
  for (const entry of playlists.values()) {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = entry.name;
    option.selected = entry.id === activePlaylistId;
    select.appendChild(option);
  }
}

function renderGenreFilter(): void {
  const filter = document.getElementById('genre-filter') as HTMLSelectElement;
  const previous = filter.value;
  const genres = new Set<string>();
  let node = getList()?.head ?? null;
  while (node) { genres.add(node.genre); node = node.next; }
  filter.replaceChildren();
  const all = document.createElement('option');
  all.value = '';
  all.textContent = 'Todos los géneros';
  filter.appendChild(all);
  for (const genre of genres) {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    filter.appendChild(option);
  }
  if (genres.has(previous)) filter.value = previous;
}

function renderGenreSuggestions(): void {
  const genres = new Set(genreSuggestions);
  for (const entry of playlists.values()) {
    let node = entry.list.head;
    while (node) { genres.add(node.genre); node = node.next; }
  }
  const datalist = document.getElementById('genre-suggestions')!;
  datalist.replaceChildren();
  for (const genre of genres) {
    const option = document.createElement('option');
    option.value = genre;
    datalist.appendChild(option);
  }
}

function createPlaylist(name: string): void {
  const cleanName = name.trim();
  if (!cleanName) return;
  if (Array.from(playlists.values()).some(entry => norm(entry.name) === norm(cleanName))) {
    setStatus('Ya existe una playlist con ese nombre.');
    return;
  }
  const entry = { id: id(), name: cleanName, list: new DoublyLinkedList() };
  playlists.set(entry.id, entry);
  activePlaylistId = entry.id;
  renderPlaylists();
  renderGenreFilter();
  updatePlayer();
  saveLibrary();
  setStatus(`Se creó la playlist «${entry.name}».`);
}

async function addUploadedTrack(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const entry = getPlaylist();
  const list = entry?.list;
  const form = event.currentTarget as HTMLFormElement;
  const title = (document.getElementById('upload-title') as HTMLInputElement).value.trim();
  const artist = (document.getElementById('upload-artist') as HTMLInputElement).value.trim();
  const genre = (document.getElementById('upload-genre') as HTMLInputElement).value.trim();
  const file = (document.getElementById('upload-file') as HTMLInputElement).files?.[0];
  if (!entry || !list || !file) return;
  const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/x-mp3', 'application/octet-stream'];
  if (!/\.mp3$/i.test(file.name) || (file.type && !allowedMimeTypes.includes(file.type.toLowerCase()))) {
    setStatus('Selecciona un archivo MP3 válido.');
    return;
  }

  const mediaKey = id();
  try {
    await putMedia(mediaKey, file);
    const audioUrl = URL.createObjectURL(file);
    mediaObjectUrls.add(audioUrl);
    const node = list.addAtEnd(title, artist, genre, 0, audioUrl);
    trackDetails.set(node.id, { album: 'Archivo local', artworkUrl: '', sourceUrl: '', licenseName: '', licenseUrl: '', mediaKey });
    list.current = node;
    form.reset();
    (document.getElementById('upload-panel') as HTMLDetailsElement).open = false;
    renderGenreSuggestions();
    renderGenreFilter();
    updatePlayer();
    saveLibrary();
    setStatus(`«${node.title}» se añadió a «${entry.name}».`);
  } catch (error) {
    console.error('No se pudo guardar el MP3:', error);
    setStatus('No se pudo guardar el MP3. Comprueba el espacio disponible en el navegador.');
  }
}

function setupListeners(): void {
  const audio = document.getElementById('audio-player') as HTMLAudioElement;
  const seek = document.getElementById('seek-slider') as HTMLInputElement;
  const volume = document.getElementById('volume-slider') as HTMLInputElement;
  const artwork = document.getElementById('album-art') as HTMLImageElement;
  audio.volume = Number(volume.value);
  volume.style.setProperty('--progress', `${Number(volume.value) * 100}%`);

  artwork.addEventListener('load', () => {
    artwork.classList.add('is-loaded');
    document.getElementById('album-art-wrap')?.classList.add('has-image');
  });
  artwork.addEventListener('error', () => {
    artwork.classList.remove('is-loaded');
    document.getElementById('album-art-wrap')?.classList.remove('has-image');
  });

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  document.getElementById('playlist-select')?.addEventListener('change', event => {
    audio.pause();
    activePlaylistId = (event.currentTarget as HTMLSelectElement).value;
    renderGenreFilter();
    updatePlayer();
    saveLibrary();
  });
  document.getElementById('create-playlist-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.getElementById('new-playlist-name') as HTMLInputElement;
    createPlaylist(input.value);
    input.value = '';
  });
  document.getElementById('upload-form')?.addEventListener('submit', event => { void addUploadedTrack(event as SubmitEvent); });

  document.getElementById('play-btn')?.addEventListener('click', () => {
    if (audio.paused) void playCurrent(); else audio.pause();
  });
  document.getElementById('next-btn')?.addEventListener('click', () => stepTrack(1));
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (audio.currentTime > 3) audio.currentTime = 0; else stepTrack(-1);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (!Number.isFinite(audio.duration)) return;
    seek.max = audio.duration.toString();
    seek.disabled = false;
    document.getElementById('duration-time')!.textContent = timeText(audio.duration);
    const current = getList()?.getCurrent();
    if (current) current.duration = audio.duration;
    renderQueue();
    saveLibrary();
    setStatus(audio.paused ? 'Listo para reproducir' : 'En reproducción');
  });
  audio.addEventListener('timeupdate', () => {
    seek.value = audio.currentTime.toString();
    seek.style.setProperty('--progress', `${audio.duration ? audio.currentTime / audio.duration * 100 : 0}%`);
    document.getElementById('current-time')!.textContent = timeText(audio.currentTime);
  });
  audio.addEventListener('playing', () => setPlayingState(true));
  audio.addEventListener('pause', () => { if (!audio.ended) setPlayingState(false); });
  audio.addEventListener('ended', () => stepTrack(1));
  audio.addEventListener('error', () => { setStatus('No se pudo reproducir esta pista.'); setPlayingState(false); });
  seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value); });
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    volume.style.setProperty('--progress', `${audio.volume * 100}%`);
  });
  document.getElementById('speed-select')?.addEventListener('change', event => {
    audio.playbackRate = Number((event.currentTarget as HTMLSelectElement).value);
  });

  document.getElementById('track-search')?.addEventListener('input', renderQueue);
  document.getElementById('genre-filter')?.addEventListener('change', renderQueue);
  document.getElementById('song-list')?.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    const item = target.closest<HTMLLIElement>('[data-track-id]');
    const action = target.closest<HTMLButtonElement>('[data-action]')?.dataset.action;
    if (!item || target.closest('.queue-drag-handle')) return;
    if (action === 'up') moveTrack(item.dataset.trackId!, -1);
    else if (action === 'down') moveTrack(item.dataset.trackId!, 1);
    else if (action === 'remove') removeTrack(item.dataset.trackId!);
    else {
      const selected = findTrack(item.dataset.trackId!);
      const list = getList();
      if (!selected || !list) return;
      list.current = selected;
      updatePlayer(true);
    }
  });

  document.getElementById('song-list')?.addEventListener('pointerdown', event => {
    const target = event.target as HTMLElement;
    const handle = target.closest<HTMLButtonElement>('.queue-drag-handle');
    const item = target.closest<HTMLLIElement>('[data-track-id]');
    if (!handle || !item || event.button !== 0) return;
    pointerDrag = { id: item.dataset.trackId ?? '', startX: event.clientX, startY: event.clientY, active: false };
    handle.setPointerCapture(event.pointerId);
  });
  document.getElementById('song-list')?.addEventListener('pointermove', event => {
    if (!pointerDrag) return;
    if (Math.hypot(event.clientX - pointerDrag.startX, event.clientY - pointerDrag.startY) < 6) return;
    pointerDrag.active = true;
    event.preventDefault();
    document.body.classList.add('is-reordering');
    document.querySelectorAll('.queue-item.drop-target').forEach(item => item.classList.remove('drop-target'));
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.queue-item');
    if (target && (target as HTMLElement).dataset.trackId !== pointerDrag.id) target.classList.add('drop-target');
  });
  document.getElementById('song-list')?.addEventListener('pointerup', event => {
    if (!pointerDrag) return;
    const drag = pointerDrag;
    const destination = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLLIElement>('[data-track-id]');
    pointerDrag = null;
    document.body.classList.remove('is-reordering');
    document.querySelectorAll('.queue-item.drop-target').forEach(item => item.classList.remove('drop-target'));
    const list = getList();
    const moving = findTrack(drag.id, list);
    const target = findTrack(destination?.dataset.trackId ?? '', list);
    if (!drag.active || !list || !moving || !target || moving === target) return;
    const bounds = destination!.getBoundingClientRect();
    if (event.clientY < bounds.top + bounds.height / 2) moveBefore(list, moving, target); else moveAfter(list, moving, target);
    renderQueue();
    saveLibrary();
  });
  document.getElementById('song-list')?.addEventListener('pointercancel', () => {
    pointerDrag = null;
    document.body.classList.remove('is-reordering');
    document.querySelectorAll('.queue-item.drop-target').forEach(item => item.classList.remove('drop-target'));
  });
}

export async function initializeDrakDj(): Promise<void> {
  renderShell();
  try {
    await restoreLibrary();
    renderPlaylists();
    renderGenreSuggestions();
    renderGenreFilter();
    renderQueue();
    updatePlayer();
  } catch (error) {
    console.error('No se pudo inicializar drak-dj:', error);
    setStatus('No se pudo abrir el almacenamiento local de MP3 en este navegador.');
  }
}

window.addEventListener('pagehide', () => mediaObjectUrls.forEach(url => URL.revokeObjectURL(url)));