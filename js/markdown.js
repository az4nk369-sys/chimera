// markdown.js — renderer Markdown mini tanpa dependensi.
// Input selalu di-escape dulu, jadi output aman dimasukkan via innerHTML.

import { escapeHtml } from './utils.js';

function inline(text) {
  let out = escapeHtml(text);
  // inline code
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  // italic
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/_([^_]+)_/g, '<em>$1</em>');
  // link
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return out;
}

export function renderMarkdown(src) {
  const lines = String(src ?? '').split('\n');
  let html = '';
  let inCode = false;
  let codeBuf = [];
  let listType = null; // 'ul' | 'ol' | null
  let para = [];

  function flushPara() {
    if (para.length) {
      html += `<p>${inline(para.join(' '))}</p>`;
      para = [];
    }
  }
  function closeList() {
    if (listType) {
      html += `</${listType}>`;
      listType = null;
    }
  }

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html += `<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`;
        codeBuf = [];
        inCode = false;
      } else {
        flushPara();
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(raw);
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      const level = heading[1].length;
      html += `<h${level}>${inline(heading[2])}</h${level}>`;
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const type = ul ? 'ul' : 'ol';
      if (listType !== type) {
        closeList();
        html += `<${type}>`;
        listType = type;
      }
      html += `<li>${inline((ul || ol)[1])}</li>`;
      continue;
    }
    if (line.trim() === '') {
      flushPara();
      closeList();
      continue;
    }
    closeList();
    para.push(line.trim());
  }
  flushPara();
  closeList();
  if (inCode) {
    html += `<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`;
  }
  return html || '<p class="muted">Belum ada isi — tulis Markdown di editor.</p>';
}
