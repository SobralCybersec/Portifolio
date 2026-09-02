const IMAGE_EXTENSION_RE = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

export function shouldRenderVideoPreview(isVideo: boolean | undefined, source: string | undefined): boolean {
  return Boolean(isVideo && source && !IMAGE_EXTENSION_RE.test(source));
}
