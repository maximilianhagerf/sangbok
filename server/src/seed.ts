/**
 * seed.ts — Run once to populate the database from the existing HTML file.
 * Usage: npm run seed (from server/ directory)
 */
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import db from './db'

const HTML_PATH = path.join(__dirname, '../../print/disney_songs_swedish.html')

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<em>(.*?)<\/em>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .trim()
}

interface SongData {
  title: string
  credit?: string
  original?: string
  columns: number
  sections: { label?: string; content: string; chords: { line: number; chord: string }[] }[]
}

function parseSongBlock($: cheerio.CheerioAPI, container: cheerio.Cheerio<any>): SongData {
  const title = container.find('h2.song-title').first().text().trim()
  const credit = container.find('.song-credit').first().text().trim() || undefined
  const original = container.find('.song-original').first().text().trim() || undefined

  const lyricsDiv = container.find('.lyrics').first()
  const columnsClass = lyricsDiv.attr('class') ?? ''
  let columns = 2
  if (columnsClass.includes('single')) columns = 1
  if (columnsClass.includes('three')) columns = 3

  const sections: SongData['sections'] = []

  lyricsDiv.find('.section').each((_, secEl) => {
    const $sec = $(secEl)
    const label = $sec.find('.section-label').text().trim() || undefined
    const chords: { line: number; chord: string }[] = []
    const contentLines: string[] = []
    let lineCounter = 0

    // Walk child nodes to preserve chord→lyric association
    $sec.children().each((_, child) => {
      const $child = $(child)
      const tagName = (child as any).tagName?.toLowerCase()

      if (tagName === 'span' && $child.hasClass('chord')) {
        // Next <p> will start at this lineCounter
        chords.push({ line: lineCounter, chord: $child.text().trim() })
      } else if (tagName === 'p' && !$child.hasClass('section-label')) {
        const text = htmlToText($child.html() ?? '')
        const lines = text.split('\n').filter(l => l !== '')
        contentLines.push(...lines)
        lineCounter += lines.length
      }
    })

    // If no chord-interleaved structure, fall back to full <p> content
    if (contentLines.length === 0) {
      $sec.find('p:not(.section-label)').each((_, p) => {
        const text = htmlToText($(p).html() ?? '')
        contentLines.push(text)
      })
    }

    sections.push({
      label,
      content: contentLines.join('\n'),
      chords: chords.length > 0 ? chords : [],
    })
  })

  return { title, credit, original, columns, sections }
}

function seed() {
  const existing = (db.prepare('SELECT COUNT(*) as c FROM songs').get() as any).c
  if (existing > 0) {
    console.log(`Database already has ${existing} songs. Delete sangbok.db to re-seed.`)
    return
  }

  const html = fs.readFileSync(HTML_PATH, 'utf-8')
  const $ = cheerio.load(html)

  const songs: SongData[] = []

  // Each .page div (skip the cover which has .cover class)
  $('.page:not(.cover)').each((_, pageEl) => {
    const $page = $(pageEl)

    // Check if this page has multiple songs (separated by hr.song-divider)
    if ($page.find('hr.song-divider').length > 0) {
      // Split into sub-blocks
      const dividerIndex = $page.find('> *').index($page.find('hr.song-divider').first())
      const allChildren = $page.find('> *').toArray()

      // First song: everything up to the divider
      const firstWrapper = $('<div></div>')
      for (let i = 0; i < dividerIndex; i++) firstWrapper.append($(allChildren[i]).clone())
      songs.push(parseSongBlock($, firstWrapper))

      // Second song: everything after the divider
      const secondWrapper = $('<div></div>')
      for (let i = dividerIndex + 1; i < allChildren.length; i++) secondWrapper.append($(allChildren[i]).clone())
      songs.push(parseSongBlock($, secondWrapper))
    } else {
      songs.push(parseSongBlock($, $page))
    }
  })

  const insertSong = db.prepare(
    `INSERT INTO songs (title, credit, original, columns, position) VALUES (?, ?, ?, ?, ?)`
  )
  const insertSection = db.prepare(
    `INSERT INTO sections (song_id, label, content, chords, position) VALUES (?, ?, ?, ?, ?)`
  )

  const insertAll = db.transaction(() => {
    songs.forEach((song, songIdx) => {
      if (!song.title) return // skip empty parses (footer divs, etc.)
      const result = insertSong.run(
        song.title,
        song.credit ?? null,
        song.original ?? null,
        song.columns,
        songIdx + 1
      )
      const songId = result.lastInsertRowid

      song.sections.forEach((sec, secIdx) => {
        insertSection.run(
          songId,
          sec.label ?? null,
          sec.content,
          sec.chords.length > 0 ? JSON.stringify(sec.chords) : null,
          secIdx + 1
        )
      })
    })
  })

  insertAll()

  const count = (db.prepare('SELECT COUNT(*) as c FROM songs').get() as any).c
  console.log(`Seeded ${count} songs.`)
}

seed()
