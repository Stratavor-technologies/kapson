"use strict";
const s3 = require("../providers/s3");
const crypto = require("crypto");
const { isEmpty } = require("underscore");
const path = require("path");
const fs = require("fs").promises;
const baseUrl = require("../../../config/develop").webServer.baseUrl;
//const min_io = require("../providers/min_io");
const s3bucket = require("../providers/s3");
//single image Upload;
exports.imageUpload = async (req, res) => {
  let uploadData = req.files[0];
  let data = await s3bucket.uploadImageToS3(uploadData);
  return res.data(data);
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
  // let value = await min_io.uploadMultipleToMin(uploadData);
  let value = await s3bucket.uploadMultipleImageToS3(uploadData);
  return res.data(value);
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
