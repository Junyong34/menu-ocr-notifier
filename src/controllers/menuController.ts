import { Request, Response } from 'express';
import { getLatestWeeklyMenu } from '../services/imageService';

export const getWeeklyMenu = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const weeklyMenu = await getLatestWeeklyMenu();

    if (!weeklyMenu) {
      res.status(404).json({
        success: false,
        message: '주간 메뉴를 찾을 수 없습니다.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: weeklyMenu,
    });
  } catch (error) {
    console.error('주간 메뉴를 가져오는 중 오류가 발생했습니다:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};
