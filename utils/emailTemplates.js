export const forgotPwEmailTemplate = (email, link, name) => {
  return {
    to: email,
    from: `OneStopShop <${process.env.SENDER_EMAIL_FORGOT_PW}>`,
    subject: 'Password reset link',
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html lang="en">
      <head>
        <meta charset="utf-8">
      
        <title>Password reset link</title>
        <meta name="description" content="Link to reset your password">
        <meta name="author" content="OneStopShop">
      <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      
        <link rel="stylesheet" href="css/styles.css?v=1.0">
      
      </head>
      
      <body>
      <h1>Hi ${name}, do you want to reset your password?</h1> 	
	  <h3>Someone requested to reset your OneStopShop account password. If it wasn't you, please ignore this e-mail and no changes will be made to your account.</h3> 
      <h3>However, if you have requested to reset your password, please click the link below. You will be redirected to the OneStopShop password reset form.</h3>      
      <br>
      <p>Please use the following link to reset your password:</p>
      <a href=${link} style="text-decoration: underline; color: #252525; font-size: 14px;">
      Click here to reset your password</a>
      <br><br>
      <footer>This is an automatically generated e-mail, please do not reply to it. Copyright &#169; 2021 OneStopShop All rights reserved.</footer>      
      </body>
      </html>`,
  }
}
