import React from 'react'

/**
 * Parses basic markdown links [Text](URL) and raw URLs,
 * returning an array of React nodes.
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null

  // Regex to match [text](url) OR raw http/https links
  // Match 1: [Text]
  // Match 2: (URL)
  // Match 3: raw http://...
  const regex = /\[(.*?)\]\((.*?)\)|(https?:\/\/[^\s]+)/g
  
  const elements: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index))
    }

    if (match[3]) {
      // Raw URL
      const url = match[3]
      elements.push(
        <a key={match.index} href={url} target="_blank" rel="noreferrer" className="text-violet-600 hover:text-violet-800 underline underline-offset-2">
          {url}
        </a>
      )
    } else {
      // Markdown link [Text](URL)
      const linkText = match[1]
      const linkUrl = match[2]
      elements.push(
        <a key={match.index} href={linkUrl} target="_blank" rel="noreferrer" className="text-violet-600 hover:text-violet-800 underline underline-offset-2 font-medium">
          {linkText}
        </a>
      )
    }

    lastIndex = regex.lastIndex
  }

  // Push remaining text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex))
  }

  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {elements}
    </p>
  )
}
