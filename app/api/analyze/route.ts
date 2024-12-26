import PDFParser from 'pdf2json';
import { NextResponse } from 'next/server';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface PDFPage {
  Texts: Array<{ R: Array<{ T: string }> }>;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const companyType = formData.get('company_type') as string;
    const scienceLevel = formData.get('science_level') as string;
    

    if (!file || !companyType || !scienceLevel) {
      return NextResponse.json(
        { error: 'File and company type are required.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const pdfParser = new PDFParser();

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

    const extractedText = await parsePdf();

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
                  text: `Please analyse the following resume content: ${text}. The company type for this resume will be ${companyType}. The level to which the person is applying is ${scienceLevel} Provide a JSON formatted response with the following fields:
                  1. Rating from 1 to 10. (Provide an overall rating for this CV, don't be too harsh but be sober and objective in your evaluation).
                  2. An array of five resume strengths. (Create an array of 5 sentences each of which will indicate the strengths of the CV and its pros).
                  3. An array of five resume weaknesses. (Create an array of 5 sentences each pointing out the weaknesses of the resume that are worth fixing).
                  4. a text resume (5-7 sentences) with an evaluation of the resume (This is a general description of the resume that you could give with a general indication of the pros and cons, as well as a wish for improvement).
                  Do not consider the structure of the CV when analysing it (the structure and order of the text should not affect the pros and cons of the CV in any way). Analyse the CV for relevance to the current market situation, taking into account both the CV profile, the type of company and the skill level for which the CV claims to. Also analyse the size of the CV if it is necessary if the CV is very large or too short (but only if necessary). But don't be too strict, CVs can be uploaded by newbies who have little or no experience, take that into account too based on the information. Reply strictly in JSON format with no extra text either at the beginning or at the end of the message. ({rating: ..., strengths: ..., weaknesses: ..., summary: ...}).`
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

    const geminiResponse = await sendToGemini(extractedText);
    return NextResponse.json({ geminiResponse });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process the request', details: String(error) },
      { status: 500 }
    );
  }
}
