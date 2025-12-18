
export enum ImageSize {
  S1K = '1K',
  S2K = '2K',
  S4K = '4K',
}

export interface ColorInfo {
  hex: string;
  name: string;
  usage: string;
}

export interface FontPairing {
  header: string;
  body: string;
  description: string;
}

export interface BrandBible {
  brandName: string;
  tagline: string;
  missionStatement: string;
  palette: ColorInfo[];
  fontPairings: FontPairing[];
  primaryLogoUrl?: string;
  secondaryMarkUrl?: string;
  logoVariations?: string[];
  secondaryMarkVariations?: string[];
  brandVoice: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
