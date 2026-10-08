# drak-dj

Reproductor web desarrollado con TypeScript y Vite. El proyecto académico utiliza una lista doblemente enlazada para administrar la cola de reproducción y las playlists.

**Aplicación en producción:** [reproductor-web-eight.vercel.app](https://reproductor-web-eight.vercel.app/)

## Funciones

- Reproducir, pausar y navegar entre las pistas de la playlist.
- Administrar varias playlists independientes.
- Añadir pistas MP3 desde el dispositivo, con título, artista y género.
- Reordenar la cola, buscar y filtrar pistas, y quitar pistas de la playlist.
- Ajustar volumen y velocidad de reproducción.
- Cambiar entre tema claro y oscuro.
- Guardar playlists y preferencias en el navegador. Los archivos MP3 añadidos se almacenan localmente y no se suben al servidor.
- Usar pistas de demostración y carátulas generadas localmente, sin depender de recursos de audio externos.

## Tecnologías

- TypeScript
- Vite
- HTML y CSS
- IndexedDB y `localStorage` para persistencia local
- GitHub y Vercel

## Estructura del proyecto

```text
reproductor-web/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── counter.ts
│   ├── DoublyLinkedList.ts
│   ├── drakDj.ts
│   ├── main.ts
│   ├── Node.ts
│   └── style.css
├── index.html
├── package.json
└── tsconfig.json
```

## Requisitos

- Node.js y npm
- Un navegador moderno

## Ejecución local

Clona el repositorio e instala sus dependencias:

```bash
git clone https://github.com/Drako2305/Reproductor-web.git
cd Reproductor-web
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre en el navegador la URL local que muestre Vite, normalmente `http://localhost:5173/`.

## Compilación

Para comprobar los tipos de TypeScript y generar la versión optimizada:

```bash
npm run build
```

Para servir localmente esa compilación:

```bash
npm run preview
```

## Despliegue

La versión publicada está disponible en [Vercel](https://reproductor-web-eight.vercel.app/). El proyecto genera archivos estáticos en `dist/` mediante `npm run build`.

## Autor

Proyecto académico de Ingeniería de Software, desarrollado por Drako.
