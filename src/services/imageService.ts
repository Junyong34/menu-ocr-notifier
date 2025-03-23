import axios from 'axios';
import { ApiResponse, PostItem } from '../types/kakaoApi';
import { log } from 'console';

export const getLatestWeeklyMenu = async (
  customUrl?: string,
): Promise<PostItem | null> => {
  try {
    const url = customUrl || process.env.IMAGE_API_URL || '';
    console.log(url);
    const response = await axios.get<ApiResponse>(url);

    // created_at 기준으로 내림차순 정렬
    const sortedItems = response.data.posts.items.sort(
      (a, b) => b.created_at - a.created_at,
    );

    // 주간식단메뉴표 키워드가 포함된 가장 최근 게시물 찾기
    const weeklyMenuPost = sortedItems.find(
      (item) =>
        item.title.includes('주간식단메뉴표') ||
        item.title.includes('주간메뉴표'),
    );

    return weeklyMenuPost || null;
  } catch (error) {
    console.error('주간 메뉴 정보를 가져오는 중 오류가 발생했습니다:', error);
    throw error;
  }
};
