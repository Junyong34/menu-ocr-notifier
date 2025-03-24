import axios from 'axios';
import { ApiResponse, PostItem } from '../types/kakaoApi';
import { log } from 'console';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 이미지 URL을 Gemini API를 통해 분석
async function analyzeMenuImage(imageUrl: string): Promise<string> {
  try {
    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Gemini API 키가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 설정해주세요.',
      );
    }

    console.log('이미지 분석을 시작합니다...');

    // Gemini API 초기화
    const genAI = new GoogleGenerativeAI(apiKey);

    // 이미지 바이너리 데이터 가져오기
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    console.log('이미지를 성공적으로 가져왔습니다.');

    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    // Base64로 변환
    const base64Image = imageBuffer.toString('base64');
    console.log('이미지를 Base64로 변환했습니다.');

    // Gemini 모델 설정
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 프롬프트 설정
    const prompt =
      '제공된 이미지는 식단표입니다. 다음 정보를 요일별로 정리할꺼고 내가 만들어준 JSON 포멧에 맞춰서 데이터 넣어줘' +
      'JSON에 value는 내가 예시로 넣은거야 너는 이미지를 보고 채워서 넣어줘야해\n\n' +
      '```\n' +
      '{\n' +
      '  "weeklyMenu": {\n' +
      '    "0324_Mon": { // [날짜]_[요일] 형식\n' +
      '      "breakfast": { // [조식]\n' +
      '        "main": ["백미밥","호밀빵", ...], // [조식] [오늘은 집밥] 메뉴 리스트\n' +
      '        "salad" : ["구운두부버섯샐러드","모닝방", ...] // [조식] [오늘은 샐러드] 메뉴 리스트\n' +
      '      },\n' +
      '      "lunch": { // [중식]\n' +
      '        "main_1": ["중화 마파 두부 덮밥", ....], // [중식] [오늘은 집밥] 메뉴 리스트 \n' +
      '        "main_2": ["물만두국", "후르츠 탕수육", ...]// [중식] [오늘은 일품] 메뉴 리스트 \n' +
      '        "salad" : ["구운두부버섯샐러드","모닝방", ...] // [중식] [오늘은 샐러드] 메뉴 리스트\n' +
      '      }\n' +
      '    },\n' +
      '    ....\n' +
      '    "0325_Tue": { // [날짜]_[요일] 형식\n' +
      '    }\n' +
      '    .... // 금요일까지 주말은 제외\n' +
      '}\n' +
      '```\n\n' +
      'Json에 해당되는 메뉴 값이 없으면 null 값을 넣어줘\n\n' +
      '만약 해당 이미지가 주간메뉴표가 아니면 아니라고 알려줘';

    console.log('Gemini API 호출을 시작합니다...');

    // 이미지 분석 요청
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    console.log('Gemini API 응답을 받았습니다.');

    return result.response.text();
  } catch (error) {
    console.error('이미지 분석 중 오류가 발생했습니다:', error);
    throw error;
  }
}

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

// 주간 메뉴를 가져오고 분석
export const getAndAnalyzeWeeklyMenu = async (): Promise<{
  menuData: PostItem | null;
  analysis: string | null;
}> => {
  try {
    // 주간 메뉴 데이터 가져오기
    const menuData = await getLatestWeeklyMenu();

    if (!menuData || !menuData.media || menuData.media.length === 0) {
      return { menuData: null, analysis: null };
    }

    // xlarge_url이 있는 첫 번째 이미지 사용
    const imageUrl = menuData.media[0].xlarge_url;

    // 이미지 분석
    const analysis = await analyzeMenuImage(imageUrl);

    return { menuData, analysis };
  } catch (error) {
    console.error('메뉴 분석 중 오류가 발생했습니다:', error);
    throw error;
  }
};
