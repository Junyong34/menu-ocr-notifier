import { Request, Response } from 'express';
import cron from 'node-cron';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 로케일 추가
import { formatDate } from '../services/menuParserService';
interface CronTask {
  start: () => void;
  stop: () => void;
}

let scheduledTask: CronTask | null = null;

export const startCronJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (scheduledTask === null) {
      scheduledTask = await cron.schedule(
        // 주말빼고, 매 6시 00분 실행
        '0 6 * * 1-5',
        async () => {
          // console.log('월요일 7시 실행');
          try {
            await axios.get(API_ENDPOINTS.MENU.SEND_TO_SLACK);
            console.log('메뉴 전송 API 호출 성공');
          } catch (error) {
            console.error('메뉴 전송 API 호출 실패:', error);
          }
        },
        {
          timezone: 'Asia/Seoul',
        },
      );

      scheduledTask!.start();
      const now = dayjs().locale('ko'); // 현재 시간, 한국어 로케일 적용
      console.log(`[${formatDate(now)}}] 메뉴 전송 API 호출 시작`);
      console.log(`[${formatDate(dayjs())}}] 메뉴 전송 API 호출 시작2`);

      res.status(200).json({ message: 'cron 스케줄러가 시작되었습니다.' });
    } else {
      res.status(400).json({ message: '이미 cron 스케줄러가 동작 중입니다.' });
    }
  } catch (error) {
    console.error('cron 스케줄러 시작 중 오류가 발생했습니다:', error);
    res
      .status(500)
      .json({ message: 'cron 스케줄러 시작 중 오류가 발생했습니다.' });
  }
};

export const stopCronJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (scheduledTask !== null) {
      scheduledTask.stop();
      scheduledTask = null;
      res.status(200).json({ message: 'cron 스케줄러가 멈추었습니다.' });
    } else {
      res
        .status(400)
        .json({ message: 'cron 스케줄러가 동작하지 않고 있습니다.' });
    }
  } catch (error) {
    console.error('cron 스케줄러 중지 중 오류가 발생했습니다:', error);
    res
      .status(500)
      .json({ message: 'cron 스케줄러 중지 중 오류가 발생했습니다.' });
  }
};
