import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: '업로드된 파일이 없습니다.' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // public/uploads 폴더 경로 설정 및 생성
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    
    // 파일 이름이 겹치지 않게 타임스탬프 추가
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_가-힣ㄱ-ㅎㅏ-ㅣ]/g, '')}`;
    const path = join(uploadDir, fileName);
    
    // 하드디스크에 파일 저장
    await writeFile(path, buffer);
    
    // 외부 접속용 URL 반환 (Next.js public 폴더라 /uploads/파일명 으로 바로 접근 가능)
    return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
  } catch (error) {
    console.error('File Upload Error: ', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
