import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import menuRoutes from './routes/menuRoutes';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 요청 로깅 미들웨어
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// JSON 요청 본문 파싱 미들웨어
app.use(express.json());

// 라우트 등록
app.use('/api', menuRoutes);

// 기본 라우트
app.get('/', (_req: Request, res: Response) => {
  res.send('식단표 이미지 OCR 메뉴 알람 서버가 실행 중입니다.');
});

// 404 라우트 핸들러
app.use((_req: Request, res: Response) => {
  console.log('404 오류 발생 - 요청한 경로를 찾을 수 없습니다.');
  res.status(404).send('요청한 경로를 찾을 수 없습니다.');
});

// 오류 처리 미들웨어
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('서버 오류:', err);
  res.status(500).send('서버 내부 오류가 발생했습니다.');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`Webhook 엔드포인트: http://localhost:${PORT}`);
  console.log(
    `주간 메뉴 API 엔드포인트: http://localhost:${PORT}/api/weekly-menu`,
  );
});
