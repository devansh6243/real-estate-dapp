import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { imageBase64, fileName } = await req.json();
    
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Remove the data:image/png;base64, prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    // Generate a unique filename
    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '')}`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, uniqueName);
    
    // Save the file
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
