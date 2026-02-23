/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { env } from "../config/env";
import { SendEmailOptions } from "../shared/interface&types";
import AppErrors from "../errorsHelpers/AppErrors";
import status from "http-status";
import path from "node:path";
import ejs from "ejs";

const transporter = nodemailer.createTransport({
    host: env.EMAIL_SENDER.SMTP_HOST,
    secure: true,
    auth: {
        user: env.EMAIL_SENDER.SMTP_USER,
        pass: env.EMAIL_SENDER.SMTP_PASS
    },
    port: Number(env.EMAIL_SENDER.SMTP_PORT)
});


export const sendEmail = async ({ to, subject, templateName, templateData, attachments }: SendEmailOptions) => {
    try {
        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from: env.EMAIL_SENDER.SMTP_FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.fileName,
                content: attachment.content,
                contentType: attachment.contentType,
            }))
        });

        console.log(`Email send to ${to} : ${info.messageId}`);

    }
    catch (err: any) {
        console.log("Email Sending Error!", err.message);
        throw new AppErrors(status.INTERNAL_SERVER_ERROR, "Failed to send email.");
    }
};