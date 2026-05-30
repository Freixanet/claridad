const webImageMemory = new Map<string, string>();

export function getWebImageFromMemory(ref: string): string | undefined {
  return webImageMemory.get(ref);
}

export function storeWebImageInMemory(ref: string, dataUri: string): void {
  webImageMemory.set(ref, dataUri);
}

function compressDataUri(dataUri: string, maxDim: number, quality: number): Promise<string> {
  if (typeof document === 'undefined') {
    return Promise.resolve(dataUri);
  }

  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      let { width, height } = image;

      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(dataUri);
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => resolve(dataUri);
    image.src = dataUri;
  });
}

export async function compressDataUriForWeb(dataUri: string): Promise<string> {
  if (typeof document === 'undefined' || dataUri.length < 250_000) {
    return dataUri;
  }

  return compressDataUri(dataUri, 1280, 0.82);
}

export async function compressDataUriForStorage(dataUri: string): Promise<string> {
  if (typeof document === 'undefined') {
    return dataUri;
  }

  let result = await compressDataUri(dataUri, 1280, 0.78);
  if (result.length > 280_000) {
    result = await compressDataUri(result, 960, 0.68);
  }
  if (result.length > 280_000) {
    result = await compressDataUri(result, 768, 0.58);
  }
  if (result.length > 280_000) {
    result = await compressDataUri(result, 640, 0.5);
  }
  return result;
}

export async function compressForGeminiApi(dataUri: string): Promise<string> {
  if (typeof document === 'undefined') {
    return dataUri;
  }

  let result = await compressDataUri(dataUri, 1600, 0.82);
  if (result.length > 900_000) {
    result = await compressDataUri(result, 1024, 0.72);
  }
  if (result.length > 900_000) {
    result = await compressDataUri(result, 768, 0.65);
  }
  return result;
}
