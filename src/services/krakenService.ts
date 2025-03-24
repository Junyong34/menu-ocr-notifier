import axios from 'axios';
import Kraken from 'kraken';

/**
 * Kraken OCR 서비스 클래스
 * 이미지 URL을 받아 OCR 처리를 수행합니다.
 */
export class KrakenService {
  private krakenClient: any;

  /**
   * KrakenService 생성자
   * 환경 변수에서 API 키와 시크릿을 가져와 초기화합니다.
   */
  constructor() {
    const apiKey = process.env.KRAKEN_API_KEY;
    const apiSecret = process.env.KRAKEN_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error(
        'Kraken API 키와 시크릿이 설정되지 않았습니다. .env 파일에 KRAKEN_API_KEY와 KRAKEN_API_SECRET을 설정해주세요.',
      );
    }

    this.krakenClient = new Kraken({
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  /**
   * 이미지 URL을 처리하여 OCR 결과를 반환합니다.
   * @param imageUrl 처리할 이미지의 URL
   * @returns OCR 처리 결과 텍스트
   */
  async processImageUrl(imageUrl: string): Promise<string> {
    try {
      console.log(`Kraken OCR 처리 시작: ${imageUrl}`);

      const result = await this.processWithKraken(imageUrl);

      // OCR 처리된 이미지 URL에서 텍스트 추출
      if (result && result.kraked_url) {
        const ocrText = await this.extractTextFromProcessedImage(
          result.kraked_url,
        );
        return ocrText;
      } else {
        throw new Error('Kraken OCR 처리 결과가 유효하지 않습니다.');
      }
    } catch (error) {
      console.error('Kraken OCR 처리 중 오류가 발생했습니다:', error);
      throw error;
    }
  }

  /**
   * Kraken API를 사용하여 이미지를 처리합니다.
   * @param imageUrl 처리할 이미지의 URL
   * @returns Kraken API 처리 결과
   */
  private processWithKraken(imageUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const opts = {
        url: imageUrl,
        wait: true,
        // 추가 Kraken OCR 옵션이 필요한 경우 여기에 설정
        // OCR 관련 옵션 설정
        data: {
          ocr: {
            language: 'ko', // 한국어 처리
            engine: 'default', // OCR 엔진 설정
          },
        },
      };

      this.krakenClient.url(opts, (err: any, data: any) => {
        if (err) {
          console.error('Kraken OCR 처리 실패:', err);
          reject(err);
        } else {
          console.log('Kraken OCR 처리 성공:', data.kraked_url);
          resolve(data);
        }
      });
    });
  }

  /**
   * 처리된 이미지 URL에서 텍스트를 추출합니다.
   * @param processedImageUrl Kraken으로 처리된 이미지 URL
   * @returns 추출된 텍스트
   */
  private async extractTextFromProcessedImage(
    processedImageUrl: string,
  ): Promise<string> {
    try {
      // 처리된 이미지에서 텍스트 추출 로직
      // 실제 구현은 Kraken API의 OCR 결과 구조에 따라 달라질 수 있습니다
      // 여기서는 간단한 예시로 구현했습니다

      // 이미지 URL에서 텍스트 데이터 가져오기
      const response = await axios.get(processedImageUrl);

      // 응답 데이터에서 OCR 텍스트 추출
      // 실제 구현에서는 Kraken API 응답 구조에 맞게 조정 필요
      if (response.data && response.data.ocr_text) {
        return response.data.ocr_text;
      } else {
        console.log('처리된 이미지에서 OCR 텍스트를 찾을 수 없습니다.');
        return '';
      }
    } catch (error) {
      console.error('텍스트 추출 중 오류가 발생했습니다:', error);
      return '';
    }
  }

  /**
   * 이미지를 직접 업로드하여 OCR 처리합니다.
   * @param imageBuffer 이미지 버퍼
   * @returns OCR 처리 결과 텍스트
   */
  async processImageBuffer(imageBuffer: Buffer): Promise<string> {
    try {
      console.log('이미지 버퍼로 Kraken OCR 처리 시작');

      // 여기에 이미지 버퍼를 처리하는 로직 구현
      // Kraken API는 파일 업로드 방식도 지원합니다

      return '이미지 버퍼 처리 기능 구현 예정';
    } catch (error) {
      console.error('이미지 버퍼 처리 중 오류가 발생했습니다:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export const krakenService = new KrakenService();
