import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const s3 = new S3Client()

const BUCKET = process.env.BUCKET

export const uploadToS3 = async ({ file, userId }) => {
  const key = `${userId}/${uuid()}`
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  })

  try {
    await s3.send(command)

    return { key }
  } catch (error) {
    console.log(error);

    return { error }    
  }
}

// GET ALL OF THE keys FOR THE objects THAT WE NEED TO CREATE presigned urls FOR
const getImageKeysByUserId = async (userId) => {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: userId
  })

  const { Contents = [] } = await s3.send(command)

  // SORT BY LAST MODIFIED SO THE images ARE DISPLAYED IN REVERSE CHRONOLOGICAL ORDER
  return Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified)).map((image) => image.Key)
}

export const getUserPresignedUrls = async (userId) => {
  try {
    const imageKeys = await getImageKeysByUserId(userId)

    const presignedUrls = await Promise.all(imageKeys.map((key) => {
      const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key
      })

      return getSignedUrl(s3, command, { expiresIn: 900 })
    }))

    return { presignedUrls }
  } catch (error) {
    console.log(error);
    
    return { error }
  }
}