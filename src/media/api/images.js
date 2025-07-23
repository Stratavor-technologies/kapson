"use strict";
const s3 = require("../providers/s3");
const crypto = require("crypto");
const { isEmpty } = require("underscore");
const path = require("path");
const fs = require("fs").promises;
const baseUrl = require('../../../config/develop').webServer.baseUrl

//single image Upload;
exports.imageUpload = async (req, res) => {
  let uploadData = req.files;

  if (isEmpty(uploadData)) {
    throw new ApiError("image required");
  }
 
  let location = await s3.uploadToS3(
    uploadData[0],
    crypto.randomBytes(20).toString("hex")
  );
  return res.data({ url: location });

  // const fileData = req.files[0];
  // const fileName = crypto.randomBytes(20).toString("hex") + ".png";
  // const imagePath = path.resolve("images", fileName);
  // await fs.writeFile(imagePath, fileData.buffer)
  // // await deleteFile(imagePath);
  // return res.data({ url: `${baseUrl}/static/images/${fileName}` });
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log("Successfully removed file!");
  } catch (err) {
    console.log(err);
  }
};

exports.bulkUpload = async (req, res) => {
  let uploadData = req.files;

  if (isEmpty(uploadData)) {
    throw new ApiError("Images required");
  }

  const uploadPromises = uploadData.map(async (image) => {
    const data = await s3.uploadToS3(
      image,
      crypto.randomBytes(20).toString("hex")
    );
    if (data) {
      return data.Location;
    }
  });
  const results = await Promise.allSettled(uploadPromises);
  const output = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  return res.data({ urls: output });
};

exports.delete = async (req, res) => {
  await s3.deleteImage(req.body.url);
  return res.success("image deleted from s3 bucket successfully");
};

exports.uploadInFolder = async (req, res) => {
  let uploadData = req.files;
  if (isEmpty(uploadData)) {
    throw new ApiError("Image required");
  }
  const fileData = req.files[0];
  console.log(fileData);
  const fileName = crypto.randomBytes(20).toString("hex") + ".png";
  const imagePath = path.resolve("images", fileName);
  await fs.writeFile(imagePath, fileData.buffer);
  return res.data({ url: `${baseUrl}/images/${fileName}` });
};
