import { describe, it, expect } from 'vitest'
import { stripHtml } from '@/lib/security/sanitize'

describe('XSS Prevention - stripHtml', () => {
  it('strips <script> tags and leaves inner text', () => {
    const result = stripHtml('<script>alert(1)</script>')
    expect(result).toBe('alert(1)')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('</script>')
  })

  it('strips <img> tags with onerror handler', () => {
    const result = stripHtml('<img src=x onerror="alert(1)">')
    expect(result).toBe('')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('<img')
  })

  it('strips <a> with javascript: href and keeps link text', () => {
    const result = stripHtml('<a href="javascript:alert(1)">click</a>')
    expect(result).toBe('click')
    expect(result).not.toContain('javascript:')
    expect(result).not.toContain('<a')
  })

  it('strips <div> with onmouseover handler and keeps text', () => {
    const result = stripHtml('<div onmouseover="alert(1)">text</div>')
    expect(result).toBe('text')
    expect(result).not.toContain('onmouseover')
    expect(result).not.toContain('<div')
  })

  it('strips <iframe> with javascript: src completely', () => {
    const result = stripHtml('<iframe src="javascript:alert(1)"></iframe>')
    expect(result).toBe('')
    expect(result).not.toContain('iframe')
    expect(result).not.toContain('javascript')
  })

  it('strips <body> with onload handler', () => {
    const result = stripHtml('<body onload="alert(1)">')
    expect(result).toBe('')
    expect(result).not.toContain('onload')
    expect(result).not.toContain('<body')
  })

  it('strips <svg> with onload handler', () => {
    const result = stripHtml('<svg onload="alert(1)">')
    expect(result).toBe('')
    expect(result).not.toContain('onload')
    expect(result).not.toContain('<svg')
  })

  it('strips <input> with onfocus handler and autofocus', () => {
    const result = stripHtml('<input onfocus="alert(1)" autofocus>')
    expect(result).toBe('')
    expect(result).not.toContain('onfocus')
    expect(result).not.toContain('<input')
  })

  it('strips <marquee> with onstart handler', () => {
    const result = stripHtml('<marquee onstart="alert(1)">')
    expect(result).toBe('')
    expect(result).not.toContain('onstart')
    expect(result).not.toContain('<marquee')
  })

  it('strips <a> with data:text/html payload — no tags or data: protocol remain', () => {
    const result = stripHtml('<a href="data:text/html,<script>alert(1)</script>">click</a>')
    // The regex strips tags greedily; the nested <script> inside the href causes
    // the tag regex to match <a href="data:text/html,<script> as one tag.
    // What matters: no HTML tags and no data:text/html remain in the output.
    expect(result).not.toContain('<a')
    expect(result).not.toContain('<script>')
    expect(result).not.toMatch(/data\s*:\s*text\/html/i)
    expect(result).toContain('click')
  })

  it('blocks entity-encoded javascript: bypass (javascript&#58;)', () => {
    const result = stripHtml('javascript&#58;alert(1)')
    // The result should not contain a working javascript: protocol (entity-encoded or not)
    expect(result).not.toMatch(/javascript\s*:/i)
    expect(result).not.toMatch(/javascript\s*&#58;/i)
    expect(result).not.toMatch(/javascript\s*&#x3a;/i)
  })

  it('strips SCRIPT tags case-insensitively', () => {
    const result = stripHtml('<SCRIPT>alert(1)</SCRIPT>')
    expect(result).toBe('alert(1)')
    expect(result).not.toContain('<SCRIPT>')
    expect(result).not.toContain('</SCRIPT>')
    expect(result.toLowerCase()).not.toContain('<script>')
  })

  it('handles nested/broken script tags', () => {
    const result = stripHtml('<scr<script>ipt>alert(1)</scr</script>ipt>')
    // After stripping tags, the result should not form a valid <script> tag
    expect(result).not.toMatch(/<script>/i)
    expect(result).not.toContain('</script>')
  })

  it('strips <img> with empty src and onerror handler', () => {
    const result = stripHtml('<img src=""onerror="alert(1)">')
    expect(result).toBe('')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('<img')
  })

  it('leaves plain text unchanged', () => {
    const result = stripHtml('Hello World')
    expect(result).toBe('Hello World')
  })
})
