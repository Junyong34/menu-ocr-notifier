# 식단 OCR 알림봇

식단표 이미지를 OCR (자동 기록 인쇄) 데이터와 ChatGPT를 연동하여, 오늘의 메뉴 정보를 파일이나 메시지로 전달해 줍니다.

## 기능

- **OCR 추출**: Tesseract, Kraken OCR 를 이용하여 식단표 이미지에서 텍스트 데이터 추출
- **ChatGPT 연동**: OpenAI API를 이용하여 추출한 텍스트 데이터를 조건하고, 두 가지 메뉴 중 더 영양가 좋은 선택지 제공
- **스케줄러스 시스템**: node-cron을 이용하여 주말을 제외한 오전 10시에 시스템 실행
- **연동 메시지 전달**: Slack, Telegram 등의 메시지 연동을 통해 사용자에게 공유

## 사용 방법

### 1. 설치

```sh
pnpm install
```

### 2. 환경설정 (.env 파일 설정)

.env 파일에 다음 값을 설정합니다.

```ini
OPENAI_API_KEY=your_openai_api_key
OCR_SPACE_API_KEY=your_ocr_space_api_key
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 3. 시작

```sh
pnpm start
```

## 개발 환경

- **Backend**: Node.js, Express, TypeScript
- **OCR**: Tesseract, Kraken, ocr-space-api-wrapper
- **Scheduler**: node-cron
- **AI API**: OpenAI

## 작업 필드

```
- src/
```


## 라이센스

이 프로젝트는 [MIT License](https://opensource.org/licenses/MIT) 을(를) 적용합니다.
