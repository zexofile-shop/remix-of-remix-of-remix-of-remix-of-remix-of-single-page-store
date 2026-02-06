import { ImageAspectRatio } from '@/types';

// Convert aspect ratio string to CSS aspect-ratio value
export const getAspectRatioClass = (ratio: ImageAspectRatio | undefined): string => {
  switch (ratio) {
    case '1:1':
      return 'aspect-square'; // 1/1
    case '4:3':
      return 'aspect-[4/3]';
    case '3:4':
      return 'aspect-[3/4]';
    case '16:9':
      return 'aspect-video'; // 16/9
    case '9:16':
      return 'aspect-[9/16]';
    case '4:5':
      return 'aspect-[4/5]';
    case '5:4':
      return 'aspect-[5/4]';
    case '3:2':
      return 'aspect-[3/2]';
    case '2:3':
      return 'aspect-[2/3]';
    default:
      return 'aspect-[4/3]'; // Default to 4:3
  }
};

// Get numeric aspect ratio for calculations
export const getAspectRatioValue = (ratio: ImageAspectRatio | undefined): number => {
  switch (ratio) {
    case '1:1':
      return 1;
    case '4:3':
      return 4 / 3;
    case '3:4':
      return 3 / 4;
    case '16:9':
      return 16 / 9;
    case '9:16':
      return 9 / 16;
    case '4:5':
      return 4 / 5;
    case '5:4':
      return 5 / 4;
    case '3:2':
      return 3 / 2;
    case '2:3':
      return 2 / 3;
    default:
      return 4 / 3;
  }
};
