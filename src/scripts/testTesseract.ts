import dotenv from 'dotenv';
import path from 'path';
import { tesseractService } from '../services/tesseractService';

// 환경 변수 로드
dotenv.config();

async function testTesseractService() {
  try {
    console.log('테스랙트 OCR 서비스 테스트 시작');

    // 테스트 이미지 경로 (실제 경로로 수정 필요)
    const testImagePath = path.join(process.cwd(), 'assets', 'test-menu.png');

    // 현재 요일 출력
    const currentDay = tesseractService.getDay();
    console.log(`현재 요일: ${currentDay}`);

    // 이미지 OCR 처리 (영역 지정 없이 전체 이미지)
    const textResult = await tesseractService.convertImageToText(testImagePath);
    console.log('OCR 처리 결과:');
    console.log(textResult);

    // 메뉴 처리 테스트 (슬랙 알림 없이)
    const menuResult = await tesseractService.processMenuText(
      testImagePath,
      'test',
    );
    console.log('메뉴 처리 결과:');
    console.log(menuResult);

    // 워커 종료
    await tesseractService.terminateWorker();

    console.log('테스트 완료');
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await tesseractService.terminateWorker();
  }
}

// 테스트 실행
testTesseractService();
