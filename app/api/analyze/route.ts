import PDFParser from 'pdf2json';
import { NextResponse } from 'next/server';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Интерфейс для страниц PDF
interface PDFPage {
  Texts: Array<{ R: Array<{ T: string }> }>;
}

// Отключение встроенного парсинга тела запроса
export const config = {
  api: {
    bodyParser: false,
  },
};

// Основной обработчик POST-запроса
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const companyType = formData.get('company_type') as string;

    if (!file || !companyType) {
      return NextResponse.json(
        { error: 'File and company type are required.' },
        { status: 400 }
      );
    }

    // Чтение файла в буфер
    const buffer = await file.arrayBuffer();
    const pdfParser = new PDFParser();

    // Функция для парсинга PDF
    const parsePdf = (): Promise<string> =>
      new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataReady', (pdfData: unknown) => {
          const parsedData = pdfData as { Pages: PDFPage[] };
          const extractedText = parsedData.Pages.map((page) =>
            page.Texts.map((text) =>
              decodeURIComponent(text.R.map((run) => run.T).join(''))
            ).join(' ')
          ).join(' ');

          resolve(extractedText);
        });

        pdfParser.on('pdfParser_dataError', (err) => {
          reject(err.parserError || err);
        });

        pdfParser.parseBuffer(Buffer.from(buffer));
      });

    // Извлечение текста из PDF
    const extractedText = await parsePdf();

    // Отправка данных в Gemini API
    const sendToGemini = async (text: string): Promise<unknown> => {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following resume content: ${text}.
                    Company Type: ${companyType}.
                    Provide a JSON response with the following fields:
                    1. A rating from 5 to 10.
                    2. An array of five strengths of the resume.
                    3. An array of five weaknesses of the resume.
                    4. A textual summary (5-7 sentences) of the resume evaluation.
                    Do not consider the structure of the resume in your analysis. Strictly respond in JSON format. ({rating: ..., strengths: ..., weaknesses: ..., summary: ...})`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${await response.text()}`);
      }

      const data = await response.json();
      return data;
    };

    // Получение ответа от Gemini
    const geminiResponse = await sendToGemini(extractedText);
    console.log("GEMINI RESPONS", geminiResponse);

    // Возвращаем ответ в формате JSON
    return NextResponse.json({ geminiResponse });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process the request', details: String(error) },
      { status: 500 }
    );
  }
}
