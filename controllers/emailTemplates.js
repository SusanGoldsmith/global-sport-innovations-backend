export const contactFormTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
    .header { background: #2c439c; color: white; padding: 20px; }
    .content { padding: 20px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
      <p><strong>Submitted at:</strong> ${new Date(
        data.submittedAt
      ).toLocaleString()}</p>
    </div>
    <div class="footer">
      <p>This is an automated message from your website contact form.</p>
    </div>
  </div>
</body>
</html>
`
