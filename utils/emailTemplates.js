export const forgotPwEmailTemplate = (email, link, name) => {
  return {
    to: `${name} <${email}>`,
    from: `OneStopShop <${process.env.SENDER_EMAIL_FORGOT_PW}>`,
    subject: 'Password Reset link',
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

      <html lang="en">
      <head>
        <meta http-equiv="content-type" content="text/html;charset=utf-8" />
      </head>
    
      <body
        bgcolor="#414141"
        style="
          background-color: #414141;
          background-image: none;
          margin: 0px;
          padding: 0px;
        "
      >
        <table
          bgcolor="#414141"
          style="background-color: #414141; margin: 0px; padding: 0px"
          width="100%"
          height="100%"
        >
          <tr valign="top">
            <td></td>
            <td width="700" align="center">
              <table
                cellpadding="0"
                cellspacing="0"
                width="700"
                style="margin: 0px; padding: 0px"
              >
                <tr valign="top">
                  <td width="700" height="49">
                    <table cellpadding="0" cellspacing="0" width="700">
                      <tr valign="top" style="margin: 0; padding: 0">
                        <td width="146" height="49" align="left">
                          <a
                            href="https://onestopshop-next.vercel.app"
                            style="color: #252525; text-decoration: underline"
                          >
                            <p src="" style="border: 0; height: 49px">
                              OneStopShop
                            </p>                            
                          </a>
                        </td>
                        <td width="554" height="49" align="right"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr valign="top">
                  <td width="700">
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      width="700"
                      bgcolor="#FFFFFF"
                      style="
                        background-color: #ffffff;
                        color: #333333;
                        font-size: 12px;
                        line-height: 18px;
                        font-family: Arial, sans-serif;
                        text-align: justify;
                        margin: 0px;
                        padding: 0px;
                      "
                    >
                      <tr valign="top" style="line-height: 0px">
                        <td width="700" height="10" colspan="3">
                          <img src="" style="border: 0" />
                        </td>
                      </tr>
                      <tr valign="top">
                        <td width="37"></td>
                        <td
                          width="626"
                          style="padding: 25px 0 10px 0; font-size: 22px"
                        >
                          Hi ${name}, do you want to reset your password?
                        </td>
                        <td width="37"></td>
                      </tr>
                      <tr valign="top">
                        <td width="37"></td>
                        <td width="626" style="padding: 0 0 25px 0">
                          Someone requested to reset your OneStopShop account
                          password. If it wasn&#039;t you, please ignore this e-mail
                          and no changes will be made to your account. However, if
                          you have requested to reset your password, please click
                          the link below. You will be redirected to the OneStopShop
                          password reset form.
                        </td>
                        <td width="37"></td>
                      </tr>
                      <tr
                        valign="top"
                        bgcolor="f2f2f2"
                        style="background-color: #f2f2f2"
                      >
                        <td width="37"></td>    
                        <td
                          width="636"
                          height="70"
                          align="left"
                          valign="middle"
                          colspan="3"
                          style="font-size: 10px; padding: 25px 0 0 0"
                        >
                          <a
                            href=${link}
                            style="
                              text-decoration: underline;
                              color: #252525;
                              font-size: 14px;
                            "
                          >
                            Click here to reset your password
                          </a>
                        </td>
                        <td width="37"></td>
                      </tr>    
                      <tr
                        valign="top"
                        bgcolor="f2f2f2"
                        style="background-color: #f2f2f2"
                      >
                        <td width="37"></td>    
                        <td
                          width="626"
                          height="70"
                          align="center"
                          valign="middle"
                          style="
                            word-break: break-word;
                            font-size: 10px;
                            text-align: left;
                            color: #909090;
                          "
                        >
                          or, if you experience any issues, use the alternative link
                          below:<br />                          
                          <a
                            href=${link}
                            style="text-decoration: underline; color: #909090"
                          >
                            ${link}
                          </a>
                        </td>    
                        <td width="37"></td>
                      </tr>
                      <tr
                        valign="top"
                        bgcolor="f2f2f2"
                        style="background-color: #f2f2f2"
                      >
                        <td
                          width="700"
                          valign="middle"
                          colspan="3"
                          height="25"
                        ></td>
                      </tr>
                      <tr valign="top">
                        <td width="37"></td>
                        <td width="626" style="padding: 25px 0 20px 0">
                          <p style="margin: 0 0 0 0"></p>
                        </td>
                        <td width="37"></td>
                      </tr>
                      <tr valign="top" style="line-height: 0px">
                        <td width="700" colspan="3">
                          <img src="" style="border: 0" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr valign="top">
                  <td
                    width="700"
                    style="
                      color: #9a9a9a;
                      font-family: Arial, sans-serif;
                      font-size: 9px;
                      text-align: left;
                      padding: 10px 0 25px 0;
                    "
                  >
                    This is an automatically generated e-mail, please do not reply
                    to it. Copyright &#169; 2021 ONESTOPSHOP All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
            <td></td>
          </tr>
        </table>
      </body>
    </html>`,
  }
}

export const forgotPwEmailSuccessTemplate = (email, name) => {
  return {
    to: email,
    from: `OneStopShop <${process.env.SENDER_EMAIL_FORGOT_PW}>`,
    subject: 'Your password has been changed',
    text: `Hi ${name} \n 
    This is a confirmation that the password for your OneStopShop account ${email} has just been changed.\n`,
  }
}
