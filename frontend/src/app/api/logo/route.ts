import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOGO_SOURCE_PATH = `C:\\Users\\VIVOBOOK\\.gemini\\antigravity-ide\\brain\\9f4d4f7d-3908-45f0-8a96-686ff8d6b093\\media__1784818051825.png`;

export async function GET() {
  try {
    if (fs.existsSync(LOGO_SOURCE_PATH)) {
      const buffer = fs.readFileSync(LOGO_SOURCE_PATH);

      // Copy to public folder if not already copied
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const destinationPath = path.join(publicDir, 'logo-kendal.png');
      fs.writeFileSync(destinationPath, buffer);

      return new Response(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (error) {
    console.error('Error serving logo:', error);
  }

  return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
}
