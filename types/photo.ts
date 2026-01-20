// types/photo.ts
export interface Photo {
  id: string;
  file: string;        
  filename: string;    
  tags: string[];      
  width?: number;
  height?: number;
  caption?: string;
  date?: string;
}

export type Tag = string;