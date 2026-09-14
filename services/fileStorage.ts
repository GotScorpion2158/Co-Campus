import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { ensureAnonymousAuth, storage } from './firebase';

export async function uploadStudyImages(
  localUris: string[],
  noteId: string
): Promise<string[]> {
  if (!storage || localUris.length === 0) return localUris;

  // Store reference to satisfy TypeScript null check in async closure
  const firebaseStorage = storage;

  const user = await ensureAnonymousAuth();
  if (!user) return localUris;

  try {
    return await Promise.all(
      localUris.map(async (uri, index) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        const fileRef = ref(
          firebaseStorage,
          `users/${user.uid}/notes/${noteId}/${index + 1}.jpg`
        );

        await uploadBytes(fileRef, blob, {
          contentType: 'image/jpeg',
        });

        return getDownloadURL(fileRef);
      })
    );
  } catch (error) {
    console.warn('Cloud upload failed; keeping local file paths:', error);
    return localUris;
  }
}