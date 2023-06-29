const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')

// Create the config obj with credentials
// Always use environment variables or config files
// Don't hardcode your keys into code
const config = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: 'ap-northeast-1',
}
// Instantiate a new s3 client
const client = new S3Client(config)

async function getSignedFileUrl(
  fileName,
  bucket = 'devroad-bucket',
  expiresIn = 60 * 60 * 24
) {
  // Instantiate the GetObject command,
  // a.k.a. specific the bucket and key
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName,
  })

  // await the signed URL and return it
  return await getSignedUrl(client, command, { expiresIn })
}

// const getUrl = async () => {
//   const test = await getSignedFileUrl(
//     '03aP8tImQrLHfe9NKM.mp4',
//     'devroad-bucket',
//     60 * 60 * 24
//   )
//   console.log(test)
// }
// getUrl()

export default getSignedFileUrl
