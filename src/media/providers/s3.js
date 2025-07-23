const creds = require("../../../config/develop");

const awsConfig = creds.aws;
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs").promises;
const crypto = require("crypto");

const s3Client = new S3Client({
  region: awsConfig.region, // You may need to specify the region
  credentials: {
    accessKeyId: awsConfig.key,
    secretAccessKey: awsConfig.secret,
  },
});

// Upload to S3 function using AWS SDK v3
exports.uploadToS3 = async (file, id) => {
  try {
    const fileExtension = file.originalname.substr(file.originalname.lastIndexOf("."));
    const params = {
      Bucket: `${awsConfig.bucket}/${awsConfig.folder}`,
      Key: `${id}${fileExtension}`,
      Body: file.buffer,
      ContentType: file.type,
    };
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    
    const fileUrl = `https://${awsConfig.bucket}.s3.${awsConfig.region}.amazonaws.com/${awsConfig.folder}/${id}${fileExtension}`;
    
    return fileUrl; // Return the URL of the uploaded file
  } catch (error) {
    throw error;
  }
};

// Modified uploadToFolder function using uploadToS3
exports.uploadToFolder = async (uploadData) => {
  const uploadedImages = await Promise.all(
    uploadData.map(async (image) => {
      // Generate a random file name
      const fileName = crypto.randomBytes(20).toString("hex");

      // Call the uploadToS3 function and pass the image buffer and fileName
      const uploadedImageUrl = await exports.uploadToS3(image, fileName);

      // Return the URL of the uploaded image
      return uploadedImageUrl;
    })
  );
  return uploadedImages;
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
