import { SongNode } from './Node'

export class DoublyLinkedList {
  head: SongNode | null
  tail: SongNode | null
  current: SongNode | null

  constructor() {
    this.head = null
    this.tail = null
    this.current = null
  }

  addAtStart(title: string, artist: string, genre: string, duration: number, audioUrl: string): SongNode {
    const newNode = new SongNode(
      Math.random().toString(36).substr(2, 9),
      title,
      artist,
      genre,
      duration,
      audioUrl
    )

    if (!this.head) {
      this.head = newNode
      this.tail = newNode
      this.current = newNode
    } else {
      newNode.next = this.head
      this.head.prev = newNode
      this.head = newNode
      this.current = this.head
    }

    return newNode
  }

  addAtEnd(title: string, artist: string, genre: string, duration: number, audioUrl: string): SongNode {
    const newNode = new SongNode(
      Math.random().toString(36).substr(2, 9),
      title,
      artist,
      genre,
      duration,
      audioUrl
    )

    if (!this.tail) {
      this.head = newNode
      this.tail = newNode
      this.current = newNode
    } else {
      newNode.prev = this.tail
      this.tail.next = newNode
      this.tail = newNode
      this.current = this.tail
    }

    return newNode
  }

  insertAfter(afterTitle: string, title: string, artist: string, genre: string, duration: number, audioUrl: string): SongNode | null {
    let current = this.head

    while (current) {
      if (current.title === afterTitle) {
        const newNode = new SongNode(
          Math.random().toString(36).substr(2, 9),
          title,
          artist,
          genre,
          duration,
          audioUrl
        )

        newNode.next = current.next
        newNode.prev = current

        if (current.next) {
          current.next.prev = newNode
        } else {
          this.tail = newNode
        }

        current.next = newNode
        this.current = newNode
        return newNode
      }
      current = current.next
    }

    return null
  }

  remove(title: string): boolean {
    let current = this.head

    while (current) {
      if (current.title === title) {
        if (current.prev) {
          current.prev.next = current.next
        } else {
          this.head = current.next
        }

        if (current.next) {
          current.next.prev = current.prev
        } else {
          this.tail = current.prev
        }

        if (this.current === current) {
          this.current = current.next || current.prev || null
        }

        return true
      }
      current = current.next
    }

    return false
  }

  getCurrent(): SongNode | null {
    return this.current
  }

  moveNext(): SongNode | null {
    if (!this.current || !this.current.next) {
      return null
    }
    this.current = this.current.next
    return this.current
  }

  movePrev(): SongNode | null {
    if (!this.current || !this.current.prev) {
      return null
    }
    this.current = this.current.prev
    return this.current
  }
}