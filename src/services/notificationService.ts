import axios from 'axios';
import { SlackMenuMessage } from './menuParserService';

/**
 * 메신저 타입 정의
 */
export type MessengerType = 'slack' | 'discord';

/**
 * 기본 알림 메시지 인터페이스
 */
export interface NotificationMessage {
  title: string;
  message: string;
  color?: string; // 메시지 색상 (옵션)
  url?: string; // 링크 URL (옵션)
}

/**
 * 알림 서비스 클래스
 */
export class NotificationService {
  private slackWebhookUrl: string | undefined;
  private discordWebhookUrl: string | undefined;

  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  }

  /**
   * 알림을 전송합니다.
   * @param message 알림 메시지
   * @param type 메신저 타입
   */
  async sendNotification(
    message: NotificationMessage,
    type: MessengerType = 'slack',
  ): Promise<boolean> {
    try {
      switch (type) {
        case 'slack':
          return await this.sendSlackNotification(message);
        case 'discord':
          return await this.sendDiscordNotification(message);
        default:
          console.error(`지원되지 않는 메신저 타입: ${type}`);
          return false;
      }
    } catch (error) {
      console.error('알림 전송 오류:', error);
      return false;
    }
  }

  /**
   * Slack으로 알림을 전송합니다.
   * @param message 알림 메시지
   */
  private async sendSlackNotification(
    message: NotificationMessage,
  ): Promise<boolean> {
    if (!this.slackWebhookUrl) {
      console.error('Slack Webhook URL이 설정되지 않았습니다.');
      return false;
    }

    try {
      const payload = {
        attachments: [
          {
            title: message.title,
            text: message.message,
            color: message.color || '#36a64f',
            title_link: message.url,
          },
        ],
      };

      await axios.post(this.slackWebhookUrl, payload);
      return true;
    } catch (error) {
      console.error('Slack 알림 전송 오류:', error);
      return false;
    }
  }

  /**
   * Discord로 알림을 전송합니다.
   * @param message 알림 메시지
   */
  private async sendDiscordNotification(
    message: NotificationMessage,
  ): Promise<boolean> {
    if (!this.discordWebhookUrl) {
      console.error('Discord Webhook URL이 설정되지 않았습니다.');
      return false;
    }

    try {
      const payload = {
        embeds: [
          {
            title: message.title,
            description: message.message,
            color: message.color
              ? parseInt(message.color.replace('#', ''), 16)
              : 0x36a64f,
            url: message.url,
          },
        ],
      };

      await axios.post(this.discordWebhookUrl, payload);
      return true;
    } catch (error) {
      console.error('Discord 알림 전송 오류:', error);
      return false;
    }
  }

  /**
   * Slack으로 메뉴 알림을 전송합니다.
   * @param menuMessage 메뉴 메시지 객체
   */
  async sendSlackMenuNotification(
    menuMessage: SlackMenuMessage,
  ): Promise<boolean> {
    if (!this.slackWebhookUrl) {
      console.error('Slack Webhook URL이 설정되지 않았습니다.');
      return false;
    }

    try {
      console.log(
        'Slack으로 전송할 메시지:',
        JSON.stringify(menuMessage, null, 2),
      );
      const response = await axios.post(this.slackWebhookUrl, menuMessage);
      console.log('Slack 응답:', response.status, response.statusText);
      console.log('메뉴가 Slack으로 성공적으로 전송되었습니다.');
      return true;
    } catch (error) {
      console.error('Slack 메뉴 알림 전송 오류:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('응답 데이터:', error.response.data);
      }
      return false;
    }
  }
}
