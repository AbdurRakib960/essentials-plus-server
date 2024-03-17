import Email from "email-templates";
import path from "path";

const sender = new Email({
  message: {
    from: `${process.env.APP_NAME}<${process.env.SMTP_USER}>`,
  },
  transport: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  preview: false,
  views: {
    root: path.join(__dirname, "../", "templates"),
    options: {
      extension: "ejs",
    },
  },
  juice: true,
  send: true,
});

export default sender;
