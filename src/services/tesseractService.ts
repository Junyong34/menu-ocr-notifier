import { createWorker } from 'tesseract.js';
import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';

/**
 * Tesseract OCR 서비스 클래스
 * 이미지를 받아 OCR 처리를 수행합니다.
 */
export class TesseractService {
  private worker: any;
  private initialized: boolean = false;

  // 요일 위치 정보
  private DayPos: Record<string, any> = {
    Mon: { top: 100, left: 100, width: 200, height: 200 }, // 예시 값, 실제 사용 시 수정 필요
    Tue: { top: 100, left: 300, width: 200, height: 200 },
    Wed: { top: 100, left: 500, width: 200, height: 200 },
    Thu: { top: 100, left: 700, width: 200, height: 200 },
    Fri: { top: 100, left: 900, width: 200, height: 200 },
  };

  // 주말 요일
  private noDay: string[] = ['Sat', 'Sun'];

  /**
   * TesseractService 생성자
   */
  constructor() {
    this.initWorker();
  }

  /**
   * Tesseract 워커 초기화
   */
  private async initWorker(): Promise<void> {
    try {
      if (!this.initialized) {
        // import.meta 대신 __dirname 사용
        const langPath = path.join(process.cwd(), 'assets', 'kor.traineddata');

        this.worker = await createWorker();

        await this.worker.loadLanguage('kor');
        await this.worker.initialize('eng+kor');
        await this.worker.setParameters({
          tessedit_ocr_engine_mode: '2', // LSTM 기반 OCR만 사용
          tessedit_pageseg_mode: '11',
          user_defined_dpi: '300', // 입력 이미지에 맞는 DPI 값 설정
        });

        this.initialized = true;
        console.log('Tesseract 워커가 초기화되었습니다.');
      }
    } catch (error) {
      console.error('Tesseract 워커 초기화 중 오류가 발생했습니다:', error);
      throw error;
    }
  }

  /**
   * 현재 요일 반환 (dayjs 사용)
   * @returns 현재 요일 (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
   */
  public getDay(): string {
    return dayjs().format('ddd');
  }

  /**
   * 이미지를 텍스트로 변환
   * @param imageUrl 이미지 URL 또는 파일 경로
   * @param pos 이미지에서 인식할 영역 (Rectangle)
   * @returns 인식된 텍스트 배열
   */
  public async convertImageToText(
    imageUrl: string,
    pos?: any,
  ): Promise<string[]> {
    try {
      if (!this.initialized) {
        await this.initWorker();
      }

      console.log('OCR 처리 시작');
      const {
        data: { text },
      } = await this.worker.recognize(
        imageUrl,
        { rectangle: pos },
        {
          imageColor: false,
          imageGrey: false,
          imageBinary: true,
          blocks: true,
          text: true,
        },
      );

      return text
        .replaceAll(/[\r\n]+/g, '\n')
        .replaceAll(' ', '')
        .split('\n');
    } catch (error) {
      console.error('OCR 처리 중 오류가 발생했습니다:', error);
      throw error;
    }
  }

  /**
   * 메뉴 텍스트 인식 및 처리
   * @param imageUrl 이미지 URL 또는 파일 경로
   * @param version 버전 정보 (선택 사항)
   * @returns 처리 결과 또는 undefined
   */
  public async processMenuText(
    imageUrl: string,
    version?: string,
    slackHooks?: any,
  ): Promise<any> {
    try {
      const toDay = this.getDay();

      if (this.noDay.includes(toDay)) {
        console.log('주말은 메뉴를 보여주지 않습니다.');
        return;
      }

      // 현재 요일에 해당하는 위치 정보
      const toDayPos = this.DayPos[toDay];

      // 이미지 처리 및 텍스트 추출
      const menuText = await this.convertImageToText(imageUrl, toDayPos);

      // 메뉴 데이터 처리 (예시 - 실제 구현 필요)
      const homeFood = menuText.filter((line) => line.trim().length > 0);
      const homeFood2: string[] = []; // 명시적 타입 선언

      // Slack 알림 전송 (선택적)
      if (slackHooks) {
        await slackHooks({ homeFood, homeFood2 }, imageUrl, version);
      }

      return { homeFood, homeFood2 };
    } catch (error) {
      console.error('메뉴 텍스트 처리 중 오류가 발생했습니다:', error);
      await this.terminateWorker();
      throw error;
    }
  }

  /**
   * 워커 종료
   */
  public async terminateWorker(): Promise<void> {
    try {
      if (this.worker) {
        await this.worker.terminate();
        this.initialized = false;
        console.log('Tesseract 워커가 종료되었습니다.');
      }
    } catch (error) {
      console.error('Tesseract 워커 종료 중 오류가 발생했습니다:', error);
    }
  }
}

// 싱글톤 인스턴스 생성
export const tesseractService = new TesseractService();
