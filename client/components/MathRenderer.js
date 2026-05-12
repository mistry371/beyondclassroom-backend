'use client'

// Renders markdown + inline math without any extra dependencies.
// Supports: headings, bold, italic, code blocks, inline code, bullet lists, numbered lists, line breaks.
export default function MathRenderer({ content }) {
  if (!content || typeof content !== 'string') return null

  const lines = content.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} className="bg-dark-200/80 border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
          <code className="text-green-300 text-sm font-mono">{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-bold text-white mt-5 mb-2">{renderInline(line.slice(4))}</h3>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-bold text-primary mt-6 mb-3">{renderInline(line.slice(3))}</h2>)
      i++; continue
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-2xl font-bold text-white mt-6 mb-3">{renderInline(line.slice(2))}</h1>)
      i++; continue
    }

    // Bullet list
    if (line.match(/^[-*] /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(<li key={i} className="text-gray-300 leading-relaxed">{renderInline(lines[i].slice(2))}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-3 pl-2">{items}</ul>)
      continue
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(<li key={i} className="text-gray-300 leading-relaxed">{renderInline(lines[i].replace(/^\d+\. /, ''))}</li>)
        i++
      }
      elements.push(<ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-3 pl-2">{items}</ol>)
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="border-white/10 my-4" />)
      i++; continue
    }

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />)
      i++; continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-gray-300 leading-relaxed my-1">{renderInline(line)}</p>
    )
    i++
  }

  return <div className="space-y-1">{elements}</div>
}

// Renders inline markdown: **bold**, *italic*, `code`, and plain text
function renderInline(text) {
  if (!text) return null
  const parts = []
  // Split on **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let last = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(<strong key={match.index} className="text-white font-semibold">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={match.index} className="text-yellow-300 italic">{token.slice(1, -1)}</em>)
    } else if (token.startsWith('`')) {
      parts.push(<code key={match.index} className="bg-dark-200 text-green-300 px-1.5 py-0.5 rounded text-sm font-mono">{token.slice(1, -1)}</code>)
    }
    last = match.index + token.length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}
