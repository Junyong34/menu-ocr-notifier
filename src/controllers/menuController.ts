import { Request, Response } from 'express';
import {
  getLatestWeeklyMenu,
  getAndAnalyzeWeeklyMenu,
} from '../services/imageService';
import { NotificationService } from '../services/notificationService';
import {
  parseMenuTextToSlackFormat,
  parseMenuTextToMarkdownSlackFormat,
} from '../services/menuParserService';

export const getWeeklyMenu = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { menuData, analysis } = await getAndAnalyzeWeeklyMenu();

    if (!menuData) {
      res.status(404).json({
        success: false,
        message: '주간 메뉴를 찾을 수 없습니다.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        menuInfo: menuData,
        analysis: analysis,
      },
    });
  } catch (error) {
    console.error('주간 메뉴를 가져오는 중 오류가 발생했습니다:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};

export const sendMenuToSlack = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // 메시지 형식 결정 (쿼리 파라미터로 format=markdown이 있으면 마크다운 형식 사용)
    const useMarkdown = req.query.format === 'markdown';

    // 주간 메뉴 데이터와 분석 결과 가져오기
    const { menuData, analysis } = await getAndAnalyzeWeeklyMenu();

    if (!menuData) {
      res.status(404).json({
        success: false,
        message: '주간 메뉴를 찾을 수 없습니다.',
      });
      return;
    }

    if (!analysis) {
      res.status(500).json({
        success: false,
        message: '메뉴 분석에 실패했습니다.',
      });
      return;
    }

    // 분석된 텍스트를 Slack 메시지 형식으로 변환 (형식에 따라 다른 함수 사용)
    const slackMessage = useMarkdown
      ? parseMenuTextToMarkdownSlackFormat(
          analysis,
          menuData.media[0].xlarge_url,
        )
      : parseMenuTextToSlackFormat(analysis, menuData.media[0].xlarge_url);

    // Slack으로 메시지 전송
    const notificationService = new NotificationService();
    const sent =
      await notificationService.sendSlackMenuNotification(slackMessage);

    if (!sent) {
      res.status(500).json({
        success: false,
        message: 'Slack으로 메뉴 전송에 실패했습니다.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: '메뉴가 Slack으로 성공적으로 전송되었습니다.',
      data: {
        menuInfo: menuData,
        analysis: analysis,
        format: useMarkdown ? 'markdown' : 'standard',
      },
    });
  } catch (error) {
    console.error('메뉴를 Slack으로 전송하는 중 오류가 발생했습니다:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
};
