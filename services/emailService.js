import AWS from 'aws-sdk'

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-north-1',
  apiVersion: process.env.AWS_API_VERSION,
}

const SES = new AWS.SES(awsConfig)

export const sendEmail = async (toEmail, courseName, lesson, link) => {
  const params = {
    Source: process.env.EMAIL_FROM,
    Destination: {
      ToAddresses: [toEmail],
    },
    ReplyToAddresses: [process.env.EMAIL_FROM],
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
                  <html>
                  <h1>Someone asked question on</h1>
                  <h3>Course: ${courseName}</h3>
                  <h3>Lesson: ${Number(lesson) + 1}</h3>
                  <p>Please click the following link to view all questions</p>
                  <br/>
                  <a href='${link}'>View All questions</a>              
                  </html>
                  `,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Question on ${courseName}`,
      },
    },
  }

  const emailSent = SES.sendEmail(params).promise()
  emailSent
    .then((data) => {
      console.log(data)
      //   res.json({ ok: true })
    })
    .catch((err) => {
      console.log(err)
      //   res.json({ ok: false })
    })
}
