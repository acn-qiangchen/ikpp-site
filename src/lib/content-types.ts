export interface Photo {
  url: string;
  title: string;
  date: string;
}

export interface Video {
  id: string;
  title: string;
  desc: string;
  date: string;
}

export interface PublishedVoice {
  id: string;
  comment: string;
  attr: string;
  publishedAt: string;
}

export interface Content {
  photos: Photo[];
  videos: Video[];
  voices: PublishedVoice[];
}

export interface VoiceSubmission {
  id: string;
  relationship: string;
  comment: string;
  email: string;
  submittedAt: string;
}
