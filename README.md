# drak-dj - Reproductor Web & DJ Studio

> **drak-dj** es una aplicación web moderna e interactiva desarrollada en **TypeScript** y **Vite**, diseñada específicamente como proyecto académico para la gestión de estructuras de datos mediante **Listas Doblemente Enlazadas**, combinadas con una interfaz inspirada en Spotify, soporte para múltiples playlists, modo claro/oscuro y efectos DJ en tiempo real.

---

## Características Principales

- **Estructura de Datos NATIVA:** Implementación robusta de una **Lista Doblemente Enlazada (`DoublyLinkedList`)** en TypeScript (`Node.ts`, `DoublyLinkedList.ts`) que controla de forma precisa los punteros `next` y `prev` para la cola de reproducción.
- **Interfaz Minimalista Estilo Spotify:** Diseño inmersivo de alta gama con carátula centrada, barra de progreso interactiva, controles fluidos y un panel moderno para la cola de canciones.
- **Modo Claro / Modo Oscuro (Theme Toggle):** Botón de alternancia dinámica para cambiar al instante entre un tema claro limpio y un tema oscuro elegante.
- **Subida de Archivos MP3 y Asignación Automática:** Permite al usuario subir pistas de audio locales en formato MP3 indicando título, artista y género, asignando automáticamente una carátula llamativa correspondiente al género seleccionado.
- **Gestión de Múltiples Playlists:** Creación y administración de listas de reproducción independientes, cada una gestionada mediante su propia instancia de lista doble.
- **Consola DJ Virtual:** Controles deslizantes interactivos para modificar la velocidad y el pitch del audio en tiempo real.

---

## Tecnologías Utilizadas

- **Lenguaje:** TypeScript / JavaScript (ESModules)
- **Empaquetador y Entorno:** Vite
- **Estilos:** CSS3 Moderno (Variables CSS, Flexbox, Grid, soporte dinámico de temas)
- **Control de Versiones:** Git & GitHub
- **Infraestructura de Despliegue:** AWS (Amazon S3 / CloudFront)

---

## Estructura del Proyecto

```text
reproductor-web/
├── public/
├── src/
│   ├── models/
│   │   ├── Node.ts             # Estructura del nodo de la lista doble
│   │   └── DoublyLinkedList.ts # Lógica y punteros de la lista doble
│   ├── main.ts                 # Lógica principal de la UI, eventos y audio
│   └── style.css               # Estilos globales y temas (Claro/Oscuro)
├── index.html
├── package.json
└── tsconfig.json
```

---

## Instalación y Ejecución Local

Sigue estos pasos para clonar y poner en marcha el proyecto en tu máquina local:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/drakdstdj.git
   cd drakdstdj
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo local con Vite:**
   ```bash
   npm run dev
   ```

4. Abre el enlace local que aparece en tu terminal (generalmente `http://localhost:5173`) en tu navegador web.

---

##  Despliegue en Producción

Para generar los archivos estáticos optimizados listos para la nube (AWS S3):

```bash
npm run build
```

La carpeta `dist` generada contendrá todo el paquete listo para ser alojado en Amazon S3.

---

## Autor
Desarrollado como proyecto académico de Ingeniería de Software.
