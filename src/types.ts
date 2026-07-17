import { Design } from './data/productsData';

export interface ShareQueueItem {
  id: string; // Unique configuration ID
  design: Design;
  currentImage: string;
  caseImgScale: number;
  caseImgX: number;
  caseImgY: number;
  standCutout: string | null;
  standX: number;
  standY: number;
  standSize: number;
  standRotate: number;
  displayCaseType: string;
}
