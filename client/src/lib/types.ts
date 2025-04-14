// Client-side types for the application

export interface Image {
  id: number;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
  source: string;
  imageData: string;
  uploadedAt?: string;
}

export interface SimilarImage extends Image {
  similarityScore: number;
}

export interface SearchResult {
  sourceImage: number;
  results: SimilarImage[];
}

export interface SearchHistoryItem {
  id: number;
  sourceImageId: number;
  resultCount: number;
  searchedAt: string;
  sourceImage: Image;
}

export interface UploadResponse {
  success: boolean;
  imageId?: number;
  error?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortMode = 'similarity' | 'date';
