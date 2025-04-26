import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "arnab.paul.1656@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "uqbpbadcvpncgqfq",
  },
});
