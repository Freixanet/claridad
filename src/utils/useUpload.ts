import * as React from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';

interface UploadInput {
  reactNativeAsset: ImagePickerAsset;
}

interface UploadResult {
  url?: string;
  mimeType?: string | null;
  error?: string;
}

interface UploadHookResult {
  loading: boolean;
}

function useUpload(): [(input: UploadInput) => Promise<UploadResult>, UploadHookResult] {
  const [loading, setLoading] = React.useState(false);

  const upload = React.useCallback(async (input: UploadInput): Promise<UploadResult> => {
    try {
      setLoading(true);
      const asset = input.reactNativeAsset;
      if (!asset.uri) {
        throw new Error('No image selected');
      }
      if (asset.base64) {
        const mimeType = asset.mimeType ?? 'image/jpeg';
        return { url: `data:${mimeType};base64,${asset.base64}`, mimeType };
      }
      return { url: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' };
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }
      return { error: 'Upload failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;
