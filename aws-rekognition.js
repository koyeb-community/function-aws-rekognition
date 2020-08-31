/** @format */

"use strict";
const Rekognition = require("aws-sdk/clients/rekognition");
const S3 = require("aws-sdk/clients/s3");

const rekognitionFunctions = {
  "face-detection": {
    func: "detectFaces",
    responseScope: "FaceDetails",
  },
  "label-detection": {
    func: "detectLabels",
    responseScope: "Labels",
  },
  "explicit-content-detection": {
    func: "detectModerationLabels",
    responseScope: "ModerationLabels",
  },
  "text-detection": {
    func: "detectText",
    responseScope: "TextDetections",
  },
  "celebrities-detection": {
    func: "recognizeCelebrities",
    responseScope: "CelebrityFaces",
  },
};

const executeRekognition = async (
  rekognitionInstance,
  s3Instance,
  objectbBody,
  key,
  bucket,
  cb
) => {
  var params = {
    Image: {
      Bytes: objectbBody,
    },
    // Attributes: ["ALL", "DEFAULT"],
  };

  try {
    const rekognitionFunction =
      process.env.REKOGNITION_FUNCTION || "label-detection";

    if (!(rekognitionFunction in rekognitionFunctions)) {
      cb(new Error("Uknown rekognition function."));
    }

    const response = await rekognitionInstance[
      rekognitionFunctions[rekognitionFunction].func
    ](params).promise();

    await s3Instance
      .upload({
        Bucket: bucket,
        Key: `${
          process.env.REKOGNITION_FILE_REFIX || "aws-rekognition"
        }-${rekognitionFunction}-${key}.json`,
        Body: JSON.stringify(
          response[rekognitionFunctions[rekognitionFunction].responseScope],
          4,
          0
        ),
        ContentType: "application/json",
      })
      .promise();
  } catch (error) {
    cb(error);
  }
};

const getSourceObject = async (s3Instance, bucket, key, cb) => {
  try {
    const response = await s3Instance
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();

    return response.Body;
  } catch (error) {
    cb(error);
  }
};

const getS3Configuration = (sourceBucket) => {
  return {
    accessKeyId: process.env[`KOYEB_STORE_${sourceBucket}_ACCESS_KEY`],
    secretAccessKey: process.env[`KOYEB_STORE_${sourceBucket}_SECRET_KEY`],
    region: process.env[`KOYEB_STORE_${sourceBucket}_REGION`],
    endpoint: process.env[`KOYEB_STORE_${sourceBucket}_ENDPOINT`],
  };
};

const getRekognitionConfiguration = () => {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION || "eu-west-1",
  };
};

const validateEnvironment = (sourceBucket) => {
  if (!sourceBucket) {
    throw new Error("Bucket name not present in event payload.");
  }

  if (
    !process.env?.[`KOYEB_STORE_${sourceBucket}_ACCESS_KEY`] ||
    !process.env?.[`KOYEB_STORE_${sourceBucket}_SECRET_KEY`] ||
    !process.env[`KOYEB_STORE_${sourceBucket}_REGION`] ||
    !process.env[`KOYEB_STORE_${sourceBucket}_ENDPOINT`]
  ) {
    throw new Error(
      `One of the following environment variables are missing: KOYEB_STORE_${sourceBucket}_ACCESS_KEY, KOYEB_STORE_${sourceBucket}_SECRET_KEY, KOYEB_STORE_${sourceBucket}_ENDPOINT, KOYEB_STORE_${sourceBucket}_REGION.`
    );
  }

  if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
    throw Error(
      "Environment variables AWS_ACCESS_KEY and AWS_SECRET_KEY must be set."
    );
  }
};

const handler = async (event, context, callback) => {
  const bucket = event?.bucket?.name;
  const key = event?.object?.key;

  validateEnvironment(bucket);

  const s3Instance = new S3(getS3Configuration(bucket));
  const rekognitionInstance = new Rekognition(getRekognitionConfiguration());

  const objectbBody = await getSourceObject(s3Instance, bucket, key, callback);

  await executeRekognition(
    rekognitionInstance,
    s3Instance,
    objectbBody,
    key,
    bucket,
    callback
  );
};

module.exports.handler = handler;
