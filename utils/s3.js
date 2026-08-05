const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

const UploadPhotoToS3 = async function (key, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Body: buffer,
    Key: key,
    ContentType: contentType,
  });
  await s3.send(command);
  //console.log(res);
};

module.exports = UploadPhotoToS3;
