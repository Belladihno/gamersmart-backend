import cloudinary from "./cloudinary.js";

const uploadImage = async (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = "data:" + file.mimetype + ";base64," + b64;

  return await cloudinary.uploader.upload(dataURI, {
    folder: "games",
    resource_type: "auto",
  });
};

const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const publicId = imageUrl.split("/").slice(-1)[0].split(".")[0];
    await cloudinary.uploader.destroy(`games/${publicId}`);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

export { uploadImage, deleteImage };
