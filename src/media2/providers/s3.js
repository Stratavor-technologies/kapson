const creds = require("../../../config/develop");
const awsConfig = creds.aws;
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs").promises;
const crypto = require("crypto");

const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: awsConfig.key,
  secretAccessKey: awsConfig.secret,
  region: awsConfig.region,
});

const s3 = new AWS.S3();
const bucketName = awsConfig.bucket;
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB in bytes

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

exports.uploadImageToS3 = async (file) => {
  try {
    // Validate file type
    // if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    //   throw new Error(
    //     "Invalid file type. Only JPEG, PNG, and GIF are allowed."
    //   );
    // }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds the 30 MB limit.");
    }

    const params = {
      Bucket: bucketName,
      Key: `care-simply-file/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload to S3
    const uploadResult = await s3.upload(params).promise();

    return { imgUrl: uploadResult.Location };
  } catch (error) {
    console.error("Error uploading image to S3:", error.message);
    throw new Error("Failed to upload image to S3");
  }
};

exports.uploadMultipleImageToS3 = async (files) => {
  try {
    const uploadResults = [];

    for (const file of files) {
      // Validate file type

      // // Validate file size
      // if (file.size > MAX_FILE_SIZE) {
      //   throw new Error(
      //     `File size exceeds the 30 MB limit for ${file.originalname}.`
      //   );
      // }

      const params = {
        Bucket: bucketName,
        Key: `care-simply-file/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      // Upload to S3
      const uploadResult = await s3.upload(params).promise();
      if (!uploadResult || !uploadResult.Location) {
        throw new Error(
          `Failed to retrieve the upload location for ${file.originalname}.`
        );
      }
      uploadResults.push(uploadResult.Location);
    }

    return uploadResults;
  } catch (error) {
    console.error("Error uploading images to S3:", error.message);
    throw new Error("Failed to upload images to S3");
  }
};

// Function to delete a file (no changes needed)
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log("Successfully removed file!");
  } catch (err) {
    console.log(err);
  }
};
