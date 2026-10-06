import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { norm } from '../utils/text.js';

/** Returns { text, pages } where pages (normalized, 1 entry per page) is null for formats without pages. */
export async function extractText(file) {
  const name = file.originalname.toLowerCase();
  let text; let pages = null;
  if (name.endsWith('.pdf')) {
    const collected = [];
    const pagerender = async (pageData) => {
      const tc = await pageData.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
      let last; let out = '';
      for (const item of tc.items) { out += last === item.transform[5] || last === undefined ? item.str : `\n${item.str}`; last = item.transform[5]; }
      collected.push(out);
      return out;
    };
    text = (await pdfParse(file.buffer, { pagerender })).text;
    pages = collected.map(norm);
  } else if (name.endsWith('.docx')) text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
  else if (name.endsWith('.txt')) text = file.buffer.toString('utf8');
  else throw Object.assign(new Error('Unsupported file type. Upload a PDF or DOCX file.'), { status: 415 });

  if (text.trim().length < 200) throw Object.assign(new Error('Could not read enough text from this file. Scanned PDFs need OCR first.'), { status: 422 });
  return { text, pages };
}
