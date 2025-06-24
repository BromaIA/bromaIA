// lib/uploadAudio.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const subirAudioAFirebase = async (blob: Blob, nombre: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `audios/${nombre}`);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  return url;
};
