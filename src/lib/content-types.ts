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

export interface Content {
  photos: Photo[];
  videos: Video[];
}
