const IMGBB_API_KEY = "1e0afe690d70016376faa5e0678ef98c";

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export const uploadToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', IMGBB_API_KEY);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const result: ImgBBResponse = await response.json();

  if (!result.success) {
    throw new Error('Image upload failed');
  }

  // Use original URL for best quality instead of display_url
  return result.data.image.url;
};

export const uploadBase64ToImgBB = async (base64: string): Promise<string> => {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  
  const formData = new FormData();
  formData.append('image', base64Data);
  formData.append('key', IMGBB_API_KEY);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const result: ImgBBResponse = await response.json();

  if (!result.success) {
    throw new Error('Image upload failed');
  }

  // Use original URL for best quality instead of display_url
  return result.data.image.url;
};
