export interface Media {
  type: string;
  url: string;
  xlarge_url: string;
  path: string;
  small_url: string;
  filename: string;
  avg: string;
  width: number;
  medium_url: string;
  mimetype: string;
  id: number;
  large_url: string;
  height: number;
}

export interface Content {
  t: string;
  v: string;
}

export interface PostItem {
  comment_count: number;
  is_private: boolean;
  pinned: boolean;
  publish_to: number;
  created_at: number;
  media: Media[];
  title: string;
  type: string;
  liked: boolean;
  updated_at: number;
  id: number;
  published_at: number;
  commentable: boolean;
  like_count: number;
  sort: string;
  adult_only: boolean;
  is_manager: boolean;
  share_count: number;
  contents: Content[];
  unlisted: boolean;
  permalink: string;
  status: string;
}

export interface Posts {
  items: PostItem[];
}

export interface ApiResponse {
  posts: Posts;
}
