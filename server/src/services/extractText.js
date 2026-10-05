import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/** Returns plain text from a PDF, DOCX or TXT upload. */
export async function extractText(file) {
  const name = file.originalname.toLowerCase();
  let text;
  if (name.endsWith('.pdf')) text = (await pdfParse(file.buffer)).text;
  else if (name.endsWith('.docx')) text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
  else if (name.endsWith('.txt')) text = file.buffer.toString('utf8');
  else throw Object.assign(new Error('Unsupported file type. Upload a PDF, DOCX or TXT file.'), { status: 415 });

  if (text.trim().length < 200) {
    throw Object.assign(new Error('Could not read enough text from this file. Scanned PDFs need OCR first.'), { status: 422 });
  }
  return text;
}
