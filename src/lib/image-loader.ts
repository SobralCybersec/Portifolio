/**
 * Custom image loaders for CDN integration
 * Uncomment and configure the loader you want to use in next.config.mjs
 */

// Cloudflare Image Loader
export function cloudflareLoader({ 
  src, 
  width, 
  quality 
}: { 
  src: string; 
  width: number; 
  quality?: number;
}): string {
  const params = [
    `width=${width}`,
    `quality=${quality || 75}`,
    'format=auto',
  ].join(',');
  
  return `https://your-domain.com/cdn-cgi/image/${params}/${src}`;
}

// CloudFront Image Loader
export function cloudFrontLoader({ 
  src, 
  width, 
  quality 
}: { 
  src: string; 
  width: number; 
  quality?: number;
}): string {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || '';
  return `${cdnUrl}${src}?w=${width}&q=${quality || 80}`;
}

// Cloudinary Image Loader
export function cloudinaryLoader({ 
  src, 
  width, 
  quality 
}: { 
  src: string; 
  width: number; 
  quality?: number;
}): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const params = [
    'f_auto',         // Auto format (AVIF/WebP/JPEG)
    'c_limit',        // Don't upscale
    `w_${width}`,
    `q_${quality || 'auto'}`,
  ].join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${src}`;
}

// Imgix Image Loader
export function imgixLoader({ 
  src, 
  width, 
  quality 
}: { 
  src: string; 
  width: number; 
  quality?: number;
}): string {
  const domain = process.env.NEXT_PUBLIC_IMGIX_DOMAIN;
  const params = new URLSearchParams({
    auto: 'format,compress',
    w: width.toString(),
    q: (quality || 75).toString(),
  });
  
  return `https://${domain}${src}?${params}`;
}

// Default export (change to your preferred loader)
export default cloudflareLoader;
