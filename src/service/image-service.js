const { uploadImageToBucket } = require("../repository/image-dao");

async function imageUpload(imageFile) {
  try {
    if (!imageFile) {
      throw new Error("Missing image file");
    }

    const bucket = "recipes-explorer";
    const objectKey = `images/${Date.now()}`;
    const contentType = imageFile.mimetype;

    const imageUrl = await uploadImageToBucket(
      bucket,
      objectKey,
      contentType,
      imageFile.buffer
    );

    return imageUrl;
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = { imageUpload };
