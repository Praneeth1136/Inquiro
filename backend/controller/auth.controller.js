import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import sendEmail from "../services/email.service.js";

export async function register(req, res) {

    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    const user = await userModel.create({ username, email, password });

    const emailVerificationToken = jwt.sign({
        email:user.email,
    },process.env.JWT_SECRET);

    await sendEmail ({
        to: email,
        subject: "Welcome to Perplexity",
        text: `Hi ${username},\n\nThank you for registering with Perplexity. We're excited to have you on board!\n\nIf you need any help, feel free to reply to this email.\n\nBest regards,\nThe Perplexity Team`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1>Welcome to Perplexity, ${username}!</h1>
                <p>Thank you for registering with us. We're excited to have you on board.</p>
                <p>Please verify your email address by clicking link below</p>
                <p>
                    <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}"
                       style="display: inline-block; padding: 10px 18px; background: #4A90E2; color: #ffffff; text-decoration: none; border-radius: 5px;">
                        Verify Your Email
                    </a>
                </p>
                <p>If you have any questions, feel free to reply to this email or visit our support page.</p>
                <p>Best regards,<br/><strong>The Perplexity Team</strong></p>
            </div>
        `
    })

    res.status(201).json({
        message:"User registered successfully",
        success:true,
        user:{
            id:user._id,
            username:user.username,
            email:user.email,
        }
    })

};


export async function resendVerification(req, res) {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        if (user.verified) {
            return res.status(400).json({
                message: "Email is already verified",
                success: false,
            });
        }

        const resendVerificationToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await sendEmail({
            to: email,
            subject: "Perplexity Email Verification",
            text: `Hi ${user.username},\n\nPlease verify your email by clicking the link below.\n\n${process.env.APP_URL || "http://localhost:3000"}/api/auth/verify-email?token=${resendVerificationToken}\n\nBest regards,\nThe Perplexity Team`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1>Hello ${user.username},</h1>
                    <p>You requested a new verification email. Click the button below to verify your address.</p>
                    <p>
                        <a href="${process.env.APP_URL || "http://localhost:3000"}/api/auth/verify-email?token=${resendVerificationToken}"
                           style="display: inline-block; padding: 10px 18px; background: #4A90E2; color: #ffffff; text-decoration: none; border-radius: 5px;">
                            Verify Your Email
                        </a>
                    </p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>Best regards,<br/><strong>The Perplexity Team</strong></p>
                </div>
            `,
        });

        return res.status(200).json({
            message: "Verification email sent",
            success: true,
        });
    } catch (err) {
        console.error("resendVerification error:", err);
        return res.status(500).json({
            message: "Unable to resend verification email",
            success: false,
        });
    }
}


export async function verifyEmail(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            const html = `
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Email Verification Failed</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: #f3f6fb; color: #333; padding: 40px; }
                        .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); padding: 32px; }
                        .title { color: #d9534f; }
                        .button { display: inline-block; margin-top: 22px; padding: 12px 20px; background: #4a90e2; color: #fff; text-decoration: none; border-radius: 6px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1 class="title">Email Verification Failed</h1>
                        <p>We could not verify your email because the verification token is missing.</p>
                        <p>Please retry the verification link from your registration email, or contact support if you need help.</p>
                    </div>
                </body>
                </html>
            `;
            return res.status(400).send(html);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            const html = `
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Email Verification Failed</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: #f3f6fb; color: #333; padding: 40px; }
                        .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); padding: 32px; }
                        .title { color: #d9534f; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1 class="title">Email Verification Failed</h1>
                        <p>The verification token is invalid or the user does not exist.</p>
                    </div>
                </body>
                </html>
            `;
            return res.status(400).send(html);
        }

        if (user.verified) {
            const html = `
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Email Already Verified</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: #f3f6fb; color: #333; padding: 40px; }
                        .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); padding: 32px; }
                        .title { color: #4a90e2; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1 class="title">Email Already Verified</h1>
                        <p>Your email address has already been verified. You can now log in to your account.</p>
                    </div>
                </body>
                </html>
            `;
            return res.send(html);
        }

        user.verified = true;
        await user.save();

        const html = `
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Email Verified</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #eff5ff; color: #1f2937; padding: 40px; }
                    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 14px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); padding: 36px; }
                    .badge { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; background: #e6f4e8; color: #1f7a36; border-radius: 999px; font-weight: 700; margin-bottom: 24px; }
                    .title { font-size: 2rem; margin-bottom: 16px; color: #0f172a; }
                    .text { line-height: 1.75; margin-bottom: 24px; }
                    .button { display: inline-block; padding: 14px 22px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="badge">✅ Email Verified</div>
                    <h1 class="title">Your email has been verified!</h1>
                    <p class="text">Thank you for confirming your email address. Your Perplexity account is now fully activated.</p>
                    <p class="text">You can now return to the login page and sign in using your credentials.</p>
                    <a class="button" href="/login">Go to Login</a>
                </div>
            </body>
            </html>
        `;

         res.send(html);
    } catch (err) {
        console.error("verifyEmail error:", err.name, err.message);

        let errorMessage = "There was a problem verifying your email. The link may have expired or become invalid.";
        if (err.name === "TokenExpiredError") {
            errorMessage = "Your verification link has expired. Please request a new verification email.";
        } else if (err.name === "JsonWebTokenError") {
            errorMessage = "This verification link is invalid. Please use the link from your email or request a new one.";
        }

        const html = `
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Email Verification Error</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #fef2f2; color: #991b1c; padding: 40px; }
                    .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,0.08); padding: 32px; }
                    .title { color: #b91c1c; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1 class="title">Email Verification Error</h1>
                    <p>${errorMessage}</p>
                    <p>Please request a new verification email or contact support for help.</p>
                </div>
            </body>
            </html>
        `;

        return res.status(400).send(html);
    }
}


export async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
            success: false,
        });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
        });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email or password",
            success: false,
        });
    }

    if (!user.verified) {
        return res.status(403).json({
            message: "Please verify your email before logging in.",
            success: false,
        });
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        message: "Login successful",
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
}



export async function getMe(req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: "Authentication required",
            success: false,
        });
    }

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
        });
    }

    res.status(200).json({
        success: true,
        user,
    });
}



// ─────────────────────────────────────────────────────────────
// ADD THIS to the bottom of src/controller/auth.controller.js
// (it's a standalone export — no other edits needed in that file)
// ─────────────────────────────────────────────────────────────

export async function logout(req, res) {
    // Options MUST match the ones used in `login` when the cookie was set,
    // otherwise the browser won't clear it.
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    return res.status(200).json({
        message: "Logged out successfully",
        success: true,
    });
}

export async function updateSystemPrompt(req, res) {
    const userId = req.user?.id;
    const { systemPrompt } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Authentication required", success: false });
    }

    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
    }

    user.systemPrompt = systemPrompt || "";
    await user.save();

    res.status(200).json({
        message: "System prompt updated successfully",
        success: true,
        systemPrompt: user.systemPrompt
    });
}