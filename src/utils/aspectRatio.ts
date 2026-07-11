export function getPhotoAspectRatio(width: number, height: number, fallback = "1 / 1") {
  if (width <= 0 || height <= 0) return fallback;
  return `${width} / ${height}`;
}

export function requirePhotoAspectRatio(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    throw new Error(`Photo dimensions must be positive. Received: ${width}x${height}.`);
  }

  return `${width} / ${height}`;
}
