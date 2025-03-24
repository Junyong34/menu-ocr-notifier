declare module 'kraken' {
  interface KrakenOptions {
    api_key: string;
    api_secret: string;
  }

  interface KrakenUrlOptions {
    url: string;
    wait?: boolean;
    data?: {
      ocr?: {
        language?: string;
        engine?: string;
      };
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface KrakenResult {
    success: boolean;
    kraked_url?: string;
    original_size?: number;
    kraked_size?: number;
    saved_bytes?: number;
    ocr_text?: string;
    [key: string]: any;
  }

  type KrakenCallback = (err: Error | null, data: KrakenResult) => void;

  class Kraken {
    constructor(options: KrakenOptions);
    url(options: KrakenUrlOptions, callback: KrakenCallback): void;
    upload(options: any, callback: KrakenCallback): void;
  }

  export = Kraken;
}
