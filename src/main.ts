import { DoublyLinkedList } from './DoublyLinkedList';
import { SongNode } from './Node';
import { initializeDrakDj } from './drakDj';
import './style.css';

interface TrackDetails {
  album: string;
  artworkUrl: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
}

interface TrackSeed {
  title: string;
  artist: string;
  genre: string;
  albumId: string;
  audioFile: string;
  licenseName: string;
  licenseUrl: string;
}

const playlist = new DoublyLinkedList();
const trackDetails = new Map<string, TrackDetails>();
const albumCoverFiles: Record<string, string> = {
  'Slam_Funk-7603': 'Slam_Funk-7603.jpg',
  'Directionless_EP-8295': 'Directionless_EP-8295.jpg',
  'Jazz_Sampler-9619': 'Jazz_Sampler-9619.jpg',
  'Classical_Sampler-9615': 'Classical_Sampler-9615.jpg',
  '20110721224709348-9605': '20110721224709348-9605.jpg',
  'jamendo-116889': 'cover.jpg',
  'hot_salsa_trip-8727': 'hot_salsa_trip-8727.jpg',
  'Dred_Reggae-18488': 'Dred_Reggae-18488.jpg'
};

const tracks: TrackSeed[] = [
  { title: 'Nothing Like Captain Crunch', artist: 'Broke For Free', genre: 'Hip-hop / Funk', albumId: 'Slam_Funk-7603', audioFile: 'Broke_For_Free_-_01_-_Nothing_Like_Captain_Crunch.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'The Great', artist: 'Broke For Free', genre: 'Hip-hop / Funk', albumId: 'Slam_Funk-7603', audioFile: 'Broke_For_Free_-_03_-_The_Great.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Caught In The Beat', artist: 'Broke For Free', genre: 'Electrónica / Funk', albumId: 'Slam_Funk-7603', audioFile: 'Broke_For_Free_-_04_-_Caught_In_The_Beat.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Hella', artist: 'Broke For Free', genre: 'Hip-hop / Funk', albumId: 'Slam_Funk-7603', audioFile: 'Broke_For_Free_-_05_-_Hella.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'High School Snaps', artist: 'Broke For Free', genre: 'Hip-hop / Funk', albumId: 'Slam_Funk-7603', audioFile: 'Broke_For_Free_-_06_-_High_School_Snaps.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Night Owl', artist: 'Broke For Free', genre: 'Indie / Electrónica', albumId: 'Directionless_EP-8295', audioFile: 'Broke_For_Free_-_01_-_Night_Owl.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'My Always Mood', artist: 'Broke For Free', genre: 'Indie / Electrónica', albumId: 'Directionless_EP-8295', audioFile: 'Broke_For_Free_-_02_-_My_Always_Mood.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Day Bird', artist: 'Broke For Free', genre: 'Indie / Electrónica', albumId: 'Directionless_EP-8295', audioFile: 'Broke_For_Free_-_03_-_Day_Bird.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Mells Parade', artist: 'Broke For Free', genre: 'Indie / Electrónica', albumId: 'Directionless_EP-8295', audioFile: 'Broke_For_Free_-_05_-_Mells_Parade.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Acid Jazz', artist: 'Kevin MacLeod', genre: 'Jazz', albumId: 'Jazz_Sampler-9619', audioFile: 'Kevin_MacLeod_-_AcidJazz.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Acid Trumpet', artist: 'Kevin MacLeod', genre: 'Jazz', albumId: 'Jazz_Sampler-9619', audioFile: 'Kevin_MacLeod_-_Acid_Trumpet.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'As I Figure', artist: 'Kevin MacLeod', genre: 'Jazz', albumId: 'Jazz_Sampler-9619', audioFile: 'Kevin_MacLeod_-_As_I_Figure.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Canon in D Major', artist: 'Kevin MacLeod', genre: 'Clásica', albumId: 'Classical_Sampler-9615', audioFile: 'Kevin_MacLeod_-_Canon_in_D_Major.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Brandenburg Concerto No. 4', artist: 'Kevin MacLeod', genre: 'Clásica', albumId: 'Classical_Sampler-9615', audioFile: 'Kevin_MacLeod_-_Brandenburg_Concerto_No4-1_BWV1049.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Dance of the Sugar Plum Fairy', artist: 'Kevin MacLeod', genre: 'Clásica', albumId: 'Classical_Sampler-9615', audioFile: 'Kevin_MacLeod_-_Dance_of_the_Sugar_Plum_Fairy.mp3', licenseName: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
  { title: 'Rock n roll, parte I', artist: 'La Mugre Roja', genre: 'Rock', albumId: '20110721224709348-9605', audioFile: 'La_Mugre_Roja_-_rock_n_roll_parte_I.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'Rock n roll, parte II', artist: 'La Mugre Roja', genre: 'Rock', albumId: '20110721224709348-9605', audioFile: 'La_Mugre_Roja_-_rock_n_roll_parte_II.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'Rock n roll, parte III', artist: 'La Mugre Roja', genre: 'Rock', albumId: '20110721224709348-9605', audioFile: 'La_Mugre_Roja_-_rock_n_roll_parte_III.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'Dune', artist: 'Jahzzar', genre: 'Indie / Electrónica', albumId: 'jamendo-116889', audioFile: '01-993747-Jahzzar-Dune.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'Revolver', artist: 'Jahzzar', genre: 'Indie / Electrónica', albumId: 'jamendo-116889', audioFile: '03-993701-Jahzzar-Revolver.mp3', licenseName: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  { title: 'PopStar', artist: 'Audionautix', genre: 'Pop', albumId: 'audionautix-music-collection', audioFile: 'PopStar.mp3', licenseName: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { title: 'Hot Salsa Trip', artist: 'Arsonist', genre: 'Salsa', albumId: 'hot_salsa_trip-8727', audioFile: 'arsonist_-_01_-_Hot_salsa_trip.mp3', licenseName: 'CC BY-NC-ND 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/3.0/' },
  { title: 'Jahnoy', artist: 'Med Dred', genre: 'Reggae', albumId: 'Dred_Reggae-18488', audioFile: 'Med_Dred_-_01_-_Jahnoy.mp3', licenseName: 'CC BY-NC-ND 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/' }
];

tracks.forEach(track => {
  const node = playlist.addAtEnd(
    track.title,
    track.artist,
    track.genre,
    0,
    `https://archive.org/download/${track.albumId}/${encodeURIComponent(track.audioFile)}`
  );
  trackDetails.set(node.id, {
    album: track.albumId,
    artworkUrl: albumCoverFiles[track.albumId]
      ? `https://archive.org/download/${track.albumId}/${encodeURIComponent(albumCoverFiles[track.albumId])}`
      : `https://archive.org/services/img/${track.albumId}`,
    sourceUrl: `https://archive.org/details/${track.albumId}`,
    licenseName: track.licenseName,
    licenseUrl: track.licenseUrl
  });
});
playlist.current = playlist.head;

let pointerDrag: { id: string; startX: number; startY: number; active: boolean } | null = null;

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function renderApp() {
  void initializeDrakDj();
  return;

  const appContainer = document.getElementById('app') || document.body;

  appContainer.innerHTML = `
    <main class="studio-shell">
      <header class="studio-header">
        <a class="brand-mark" href="#player" aria-label="RhythmDouble, inicio">rd<span>.</span></a>
        <div class="header-copy"><p>RHYTHMDOUBLE DJ</p><span>Tu música, a tu manera</span></div>
        <span class="local-badge"><i></i> REPRODUCTOR LOCAL</span>
      </header>

      <div class="studio-layout">
        <section class="player-stage" id="player" aria-label="Reproductor de música">
          <p class="section-kicker">EN REPRODUCCIÓN</p>
          <div class="album-art-wrap">
            <img id="album-art" class="album-art" alt="Portada del álbum" src="">
            <div id="art-fallback" class="art-fallback" aria-hidden="true">RD</div>
          </div>

          <div class="track-heading">
            <div class="track-copy">
              <h1 id="track-title">Selecciona una canción</h1>
              <p id="track-artist">Artista</p>
            </div>
            <span class="playing-mark" id="playing-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          </div>

          <p class="track-credit" id="track-credit"></p>

          <audio id="audio-player" preload="metadata"></audio>

          <div class="timeline">
            <time id="current-time">0:00</time>
            <input id="seek-slider" class="seek-slider" type="range" min="0" max="0" step="0.1" value="0" aria-label="Posición de reproducción" disabled>
            <time id="duration-time">--:--</time>
          </div>

          <div class="transport-controls" aria-label="Controles del reproductor">
            <button id="prev-btn" class="transport-button" type="button" aria-label="Canción anterior" title="Canción anterior">|‹</button>
            <button id="play-btn" class="play-button" type="button" aria-label="Reproducir" title="Reproducir">▶</button>
            <button id="next-btn" class="transport-button" type="button" aria-label="Canción siguiente" title="Canción siguiente">›|</button>
          </div>

          <div class="player-footer">
            <label class="volume-control" for="volume-slider"><span aria-hidden="true">◖</span><input id="volume-slider" type="range" min="0" max="1" step="0.01" value="0.8" aria-label="Volumen"></label>
            <p id="playback-status" aria-live="polite">Listo para reproducir</p>
            <label class="speed-control" for="speed-select"><span>VELOCIDAD</span><select id="speed-select" aria-label="Velocidad de reproducción"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></label>
          </div>
        </section>

        <aside class="queue-panel" aria-labelledby="queue-title">
          <div class="queue-heading">
            <div><p class="section-kicker">TU SESIÓN</p><h2 id="queue-title">Cola de reproducción</h2></div>
            <span class="queue-count" id="queue-count">21</span>
          </div>

          <div class="queue-tools">
            <label class="search-box" for="track-search">
              <span class="search-icon" aria-hidden="true"></span>
              <input id="track-search" type="search" placeholder="Buscar en tu cola" autocomplete="off" aria-label="Buscar canción, artista o género">
            </label>
            <select id="genre-filter" aria-label="Filtrar por género"><option value="">Todos los géneros</option></select>
          </div>

          <div class="queue-columns" aria-hidden="true"><span>#</span><span>CANCIÓN</span><span>TIEMPO</span><span>ORDEN</span></div>
          <ol class="song-list" id="song-list"></ol>
          <p class="empty-results" id="empty-results" hidden>No hay canciones que coincidan.</p>
          <p class="queue-hint">Arrastra una canción o usa ↑ ↓ para cambiar el orden.</p>
        </aside>
      </div>

      <footer class="studio-footer">Música independiente con licencia abierta · fuentes y créditos por canción</footer>
    </main>
  `;

  populateGenreFilter();
  renderQueue();
  setupListeners();
  updatePlayer();
}

function getTrackById(id: string): SongNode | null {
  let current = playlist.head;
  while (current) {
    if (current.id === id) return current;
    current = current.next;
  }
  return null;
}

function populateGenreFilter() {
  const filter = document.getElementById('genre-filter') as HTMLSelectElement;
  const genres = new Set<string>();
  let current = playlist.head;
  while (current) {
    genres.add(current.genre);
    current = current.next;
  }

  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    filter.appendChild(option);
  });
}

function updatePlayer(autoplay = false) {
  const current = playlist.getCurrent();
  const audio = document.getElementById('audio-player') as HTMLAudioElement;
  const title = document.getElementById('track-title');
  const artist = document.getElementById('track-artist');
  const artwork = document.getElementById('album-art') as HTMLImageElement;
  const details = current ? trackDetails.get(current.id) : undefined;

  if (!current || !title || !artist || !artwork || !details) return;

  title.textContent = current.title;
  artist.textContent = `${current.artist} · ${current.genre} · ${details.album.replaceAll('_', ' ')}`;
  artwork.src = details.artworkUrl;
  artwork.alt = `Portada del álbum ${details.album.replaceAll('_', ' ')}`;
  artwork.classList.remove('is-loaded');
  document.getElementById('art-fallback')!.textContent = current.title.slice(0, 2).toUpperCase();

  const credit = document.getElementById('track-credit')!;
  credit.replaceChildren();
  const sourceLink = document.createElement('a');
  sourceLink.href = details.sourceUrl;
  sourceLink.target = '_blank';
  sourceLink.rel = 'noreferrer';
  sourceLink.textContent = 'Fuente y álbum';
  const separator = document.createTextNode(' · ');
  const licenseLink = document.createElement('a');
  licenseLink.href = details.licenseUrl;
  licenseLink.target = '_blank';
  licenseLink.rel = 'noreferrer';
  licenseLink.textContent = details.licenseName;
  credit.append(sourceLink, separator, licenseLink);

  if (audio.getAttribute('src') !== current.audioUrl) {
    audio.src = current.audioUrl;
    audio.load();
    resetProgress();
  }

  renderQueue();
  if (autoplay) void playCurrent();
}

function resetProgress() {
  const seek = document.getElementById('seek-slider') as HTMLInputElement;
  seek.value = '0';
  seek.max = '0';
  seek.disabled = true;
  seek.style.setProperty('--progress', '0%');
  document.getElementById('current-time')!.textContent = '0:00';
  document.getElementById('duration-time')!.textContent = '--:--';
  document.getElementById('playback-status')!.textContent = 'Cargando canción…';
}

function setPlayingState(isPlaying: boolean) {
  const button = document.getElementById('play-btn') as HTMLButtonElement;
  button.textContent = isPlaying ? 'Ⅱ' : '▶';
  button.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir');
  button.title = isPlaying ? 'Pausar' : 'Reproducir';
  document.getElementById('playing-mark')?.classList.toggle('is-playing', isPlaying);
  document.getElementById('playback-status')!.textContent = isPlaying ? 'En reproducción' : 'En pausa';
}

async function playCurrent() {
  const audio = document.getElementById('audio-player') as HTMLAudioElement;
  try {
    await audio.play();
  } catch {
    document.getElementById('playback-status')!.textContent = 'No se pudo cargar el audio. Revisa tu conexión.';
    setPlayingState(false);
  }
}

function stepTrack(direction: -1 | 1) {
  const current = playlist.getCurrent();
  if (!current) return;
  const next = direction === 1
    ? current.next ?? playlist.head
    : current.prev ?? playlist.tail;
  if (!next) return;
  playlist.current = next;
  updatePlayer(true);
}

function moveNodeBefore(moving: SongNode, target: SongNode) {
  if (moving === target || moving.next === target) return;

  if (moving.prev) moving.prev.next = moving.next;
  else playlist.head = moving.next;
  if (moving.next) moving.next.prev = moving.prev;
  else playlist.tail = moving.prev;

  moving.prev = target.prev;
  moving.next = target;
  if (target.prev) target.prev.next = moving;
  else playlist.head = moving;
  target.prev = moving;
}

function moveNodeAfter(moving: SongNode, target: SongNode) {
  if (moving === target || target.next === moving) return;

  if (moving.prev) moving.prev.next = moving.next;
  else playlist.head = moving.next;
  if (moving.next) moving.next.prev = moving.prev;
  else playlist.tail = moving.prev;

  moving.prev = target;
  moving.next = target.next;
  if (target.next) target.next.prev = moving;
  else playlist.tail = moving;
  target.next = moving;
}

function moveTrack(id: string, direction: -1 | 1) {
  const moving = getTrackById(id);
  if (!moving) return;
  const target = direction === -1 ? moving.prev : moving.next;
  if (!target) return;

  if (direction === -1) moveNodeBefore(moving, target);
  else moveNodeBefore(target, moving);
  renderQueue();
}

function renderQueue() {
  const list = document.getElementById('song-list') as HTMLOListElement | null;
  if (!list) return;

  const search = normalize((document.getElementById('track-search') as HTMLInputElement).value.trim());
  const genre = (document.getElementById('genre-filter') as HTMLSelectElement).value;
  const emptyMessage = document.getElementById('empty-results')!;
  list.replaceChildren();

  let current = playlist.head;
  let position = 1;
  let visible = 0;

  while (current) {
    const next = current.next;
    const details = trackDetails.get(current.id)!;
    const matches = normalize(`${current.title} ${current.artist} ${current.genre}`).includes(search)
      && (!genre || current.genre === genre);

    if (matches) {
      const item = document.createElement('li');
      item.className = `queue-item${current === playlist.current ? ' active' : ''}`;
      item.dataset.trackId = current.id;

      const index = document.createElement('button');
      index.className = 'queue-index queue-drag-handle';
      index.type = 'button';
      index.title = 'Arrastrar para ordenar';
      index.setAttribute('aria-label', `Arrastrar ${current.title} para reordenar`);
      index.textContent = position.toString().padStart(2, '0');

      const select = document.createElement('button');
      select.className = 'queue-select';
      select.type = 'button';
      select.dataset.action = 'select';
      select.setAttribute('aria-label', `Reproducir ${current.title}`);

      const cover = document.createElement('img');
      cover.className = 'queue-cover';
      cover.src = details.artworkUrl;
      cover.alt = '';
      cover.loading = 'lazy';

      const songInfo = document.createElement('span');
      songInfo.className = 'queue-song-info';
      const songTitle = document.createElement('strong');
      songTitle.textContent = current.title;
      const songArtist = document.createElement('span');
      songArtist.textContent = `${current.artist} · ${current.genre}`;
      songInfo.append(songTitle, songArtist);
      select.append(cover, songInfo);

      const duration = document.createElement('time');
      duration.className = 'queue-duration';
      duration.textContent = current.duration > 0 ? formatTime(current.duration) : '--:--';

      const reorder = document.createElement('span');
      reorder.className = 'reorder-controls';
      const up = document.createElement('button');
      up.type = 'button';
      up.dataset.action = 'up';
      up.textContent = '↑';
      up.title = 'Mover arriba';
      up.setAttribute('aria-label', `Mover ${current.title} arriba`);
      up.disabled = !current.prev;
      const down = document.createElement('button');
      down.type = 'button';
      down.dataset.action = 'down';
      down.textContent = '↓';
      down.title = 'Mover abajo';
      down.setAttribute('aria-label', `Mover ${current.title} abajo`);
      down.disabled = !current.next;
      reorder.append(up, down);

      item.append(index, select, duration, reorder);
      list.appendChild(item);
      visible += 1;
    }

    position += 1;
    current = next;
  }

  document.getElementById('queue-count')!.textContent = `${position - 1} pistas`;
  emptyMessage.hidden = visible > 0;
}

function setupListeners() {
  const audio = document.getElementById('audio-player') as HTMLAudioElement;
  const seek = document.getElementById('seek-slider') as HTMLInputElement;
  const volume = document.getElementById('volume-slider') as HTMLInputElement;
  const artwork = document.getElementById('album-art') as HTMLImageElement;
  audio.volume = Number(volume.value);
  volume.style.setProperty('--progress', `${Number(volume.value) * 100}%`);

  artwork.addEventListener('load', () => artwork.classList.add('is-loaded'));
  artwork.addEventListener('error', () => {
    artwork.classList.remove('is-loaded');
    document.getElementById('playback-status')!.textContent = 'No se pudo cargar la portada del álbum.';
  });

  document.getElementById('play-btn')?.addEventListener('click', () => {
    if (audio.paused) void playCurrent();
    else audio.pause();
  });
  document.getElementById('next-btn')?.addEventListener('click', () => stepTrack(1));
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (audio.currentTime > 3) audio.currentTime = 0;
    else stepTrack(-1);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (!Number.isFinite(audio.duration)) return;
    seek.max = audio.duration.toString();
    seek.disabled = false;
    document.getElementById('duration-time')!.textContent = formatTime(audio.duration);
    const current = playlist.getCurrent();
    if (current) current.duration = audio.duration;
    renderQueue();
    document.getElementById('playback-status')!.textContent = 'Listo para reproducir';
  });

  audio.addEventListener('timeupdate', () => {
    seek.value = audio.currentTime.toString();
    seek.style.setProperty('--progress', `${audio.duration ? (audio.currentTime / audio.duration) * 100 : 0}%`);
    document.getElementById('current-time')!.textContent = formatTime(audio.currentTime);
  });
  audio.addEventListener('playing', () => setPlayingState(true));
  audio.addEventListener('pause', () => {
    if (!audio.ended) setPlayingState(false);
  });
  audio.addEventListener('ended', () => stepTrack(1));
  audio.addEventListener('error', () => {
    document.getElementById('playback-status')!.textContent = 'No se pudo reproducir esta pista.';
    setPlayingState(false);
  });

  seek.addEventListener('input', () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value);
  });
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
    if (!item) return;
    if (target.closest('.queue-drag-handle')) return;

    if (action === 'up') moveTrack(item.dataset.trackId!, -1);
    else if (action === 'down') moveTrack(item.dataset.trackId!, 1);
    else {
      const selected = getTrackById(item.dataset.trackId!);
      if (!selected) return;
      playlist.current = selected;
      updatePlayer(true);
    }
  });

  document.getElementById('song-list')?.addEventListener('pointerdown', event => {
    const target = event.target as HTMLElement;
    const handle = target.closest<HTMLButtonElement>('.queue-drag-handle');
    const item = target.closest<HTMLLIElement>('[data-track-id]');
    if (!handle || !item || event.button !== 0) return;
    pointerDrag = {
      id: item.dataset.trackId ?? '',
      startX: event.clientX,
      startY: event.clientY,
      active: false
    };
    handle.setPointerCapture(event.pointerId);
  });

  document.getElementById('song-list')?.addEventListener('pointermove', event => {
    if (!pointerDrag) return;
    const distance = Math.hypot(event.clientX - pointerDrag.startX, event.clientY - pointerDrag.startY);
    if (distance < 6) return;
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
    document.body.classList.remove('is-reordering');
    document.querySelectorAll('.queue-item.drop-target').forEach(item => item.classList.remove('drop-target'));
    pointerDrag = null;

    if (!drag.active || !destination || destination.dataset.trackId === drag.id) return;
    const moving = getTrackById(drag.id);
    const target = getTrackById(destination.dataset.trackId ?? '');
    if (!moving || !target) return;
    if (event.clientY < destination.getBoundingClientRect().top + destination.getBoundingClientRect().height / 2) {
      moveNodeBefore(moving, target);
    } else {
      moveNodeAfter(moving, target);
    }
    renderQueue();
  });

  document.getElementById('song-list')?.addEventListener('pointercancel', () => {
    pointerDrag = null;
    document.body.classList.remove('is-reordering');
    document.querySelectorAll('.queue-item.drop-target').forEach(item => item.classList.remove('drop-target'));
  });
}

document.addEventListener('DOMContentLoaded', renderApp);