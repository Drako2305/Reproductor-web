export class SongNode {
  id: string
  title: string
  artist: string
  genre: string
  duration: number
  audioUrl: string
  prev: SongNode | null
  next: SongNode | null

  constructor(id: string, title: string, artist: string, genre: string, duration: number, audioUrl: string) {
    this.id = id
    this.title = title
    this.artist = artist
    this.genre = genre
    this.duration = duration
    this.audioUrl = audioUrl
    this.prev = null
    this.next = null
  }
}