import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanager.com",
        },
    });

    const emailTextual = mailGenerator.generatePlaintext(
        options.mailgenContent,
    );

    const emailHTML = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: "mail.taskmanager.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error(
            "Email service failed, make sure that you have provided credentials are in the .env file",
        );
        console.error("Error: ", error);
    }
};

const emailVerificationMailGenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app, excited to have you on board!",
            action: {
                instructions:
                    "To verify your email, click on the following button",
                button: {
                    color: "#22BC66",
                    text: "Verify your Email",
                    link: verificationURL,
                },
            },
            outro: "Need help, or have questions? Just reply to this email. We'd love to assist you.",
        },
    };
};

const forgotPasswordMailGenContent = (username, passwordResetURl) => {
    return {
        body: {
            name: username,
            intro: "Reset your password",
            action: {
                instructions: "To reset your pass please click on the button.",
                button: {
                    color: "#0242a8",
                    text: "Reset your password",
                    link: passwordResetURl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email. We'd love to assist you.",
        },
    };
};

export {
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent,
    sendEmail,
};
