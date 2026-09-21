const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'ogg'];

export function getBannerMediaType(url: string | null | undefined): 'image' | 'video' {
  if (!url) return 'image';
  const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase();
  return ext && VIDEO_EXTENSIONS.includes(ext) ? 'video' : 'image';
}

