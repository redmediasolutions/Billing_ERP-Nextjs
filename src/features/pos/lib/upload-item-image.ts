import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/firebase/config";
import { waitForAuthUser } from "@/lib/wait-for-auth";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadItemImage(file: File): Promise<string> {
  const user = (await waitForAuthUser()) ?? auth.currentUser;
  if (!user) {
    throw new Error("Please sign in to upload images.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `items/${user.uid}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
