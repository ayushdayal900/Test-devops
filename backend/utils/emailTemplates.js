const getEmailTemplate = (title, content, link = 'https://mahalaxmi-tailors.shop', linkText = 'Visit Website') => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #4a0404; padding: 20px; text-align: center; } /* Dark Red/Maroon theme */
        .header img { max-height: 80px; }
        .content { padding: 30px; color: #333333; line-height: 1.6; }
        .button { display: inline-block; padding: 12px 24px; background-color: #d4af37; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; } /* Gold button */
        .footer { background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- Logo hosted on the public domain -->
          <img src="https://mahalaxmi-tailors.shop/logo.png" alt="Mahalaxmi Tailors Logo" />
        </div>
        <div class="content">
          <h2 style="color: #4a0404;">${title}</h2>
          ${content}
          <div style="text-align: center;">
            <a href="${link}" class="button">${linkText}</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Mahalaxmi Tailors. All rights reserved.</p>
          <p>Experince the art of perfect fitting.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getEmailTemplate };
