import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { getAndAnalyzeWeeklyMenu } from '../services/imageService';
import { NotificationService } from '../services/notificationService';
import {
  parseMenuTextToSlackFormat,
  parseMenuTextToMarkdownSlackFormat,
} from '../services/menuParserService';

dotenv.config();
// .env 파일 경로 확인
const envPath = path.resolve(process.cwd(), '.env');
console.log(`환경 변수 파일 경로: ${envPath}`);
console.log(`파일 존재 여부: ${fs.existsSync(envPath) ? '있음' : '없음'}`);

console.log(process.env.GEMINI_API_KEY, '키 확인');
// 테스트용 API 키 직접 설정 (기존 환경 변수가 로드되지 않는 경우)
if (!process.env.GEMINI_API_KEY) {
  console.log('환경 변수에서 API 키를 찾을 수 없어 직접 설정합니다.');
}

async function testMenuAnalysis() {
  try {
    console.log('주간 메뉴 분석 테스트를 시작합니다...');

    const { menuData, analysis } = await getAndAnalyzeWeeklyMenu();

    if (!menuData) {
      console.log('주간 메뉴를 찾을 수 없습니다.');
      return;
    }

    console.log('\n====== 메뉴 정보 ======');
    console.log(`제목: ${menuData.title}`);
    console.log(
      `게시일: ${new Date(menuData.created_at * 1000).toLocaleDateString()}`,
    );

    if (menuData.media && menuData.media.length > 0) {
      console.log(`이미지 URL: ${menuData.media[0].xlarge_url}`);
    }

    console.log('\n====== 분석 결과 ======');
    console.log(analysis);

    // Slack 테스트 기능 추가
    if (process.argv.includes('--slack-test')) {
      if (analysis) {
        await testSlackNotification(analysis, menuData.media[0].xlarge_url);
      } else {
        console.log('\n메뉴 분석 결과가 없어 Slack 테스트를 건너뜁니다.');
      }
    }

    console.log('\n테스트가 완료되었습니다.');
  } catch (error) {
    console.error('테스트 중 오류가 발생했습니다:', error);
  }
}

/**
 * Slack 알림 테스트 함수
 * @param analysis 분석된 메뉴 텍스트
 * @param imageUrl 메뉴 이미지 URL
 */
async function testSlackNotification(analysis: string, imageUrl: string) {
  try {
    console.log('\n====== Slack 알림 테스트 시작 ======');

    const notificationService = new NotificationService();

    // 전송할 포맷 결정 (명령줄 인수로 받음)
    const sendType1 = !process.argv.includes('--only-markdown');
    const sendType2 = !process.argv.includes('--only-standard');

    // Type1 (표준 포맷) 테스트
    if (sendType1) {
      console.log('\n[테스트 1] 표준 형식으로 Slack 메시지 전송 중...');
      const standardMessage = parseMenuTextToSlackFormat(analysis, imageUrl);
      const result1 =
        await notificationService.sendSlackMenuNotification(standardMessage);
      console.log(
        `표준 형식 Slack 메시지 전송 결과: ${result1 ? '성공' : '실패'}`,
      );
    }

    // Type2 (마크다운 포맷) 테스트
    if (sendType2) {
      console.log('\n[테스트 2] 마크다운 형식으로 Slack 메시지 전송 중...');
      const markdownMessage = parseMenuTextToMarkdownSlackFormat(
        analysis,
        imageUrl,
      );
      const result2 =
        await notificationService.sendSlackMenuNotification(markdownMessage);
      console.log(
        `마크다운 형식 Slack 메시지 전송 결과: ${result2 ? '성공' : '실패'}`,
      );
    }

    console.log('\n====== Slack 알림 테스트 완료 ======');
  } catch (error) {
    console.error('Slack 알림 테스트 중 오류가 발생했습니다:', error);
  }
}

// 테스트 실행
testMenuAnalysis();
