<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset your SkillPath AI password</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fb;color:#17283f;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f7fb;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #dce4ef;border-radius:16px;">
                    <tr>
                        <td style="padding:20px 24px;background-color:#17395c;color:#ffffff;border-radius:15px 15px 0 0;font-size:20px;font-weight:bold;">
                            SkillPath AI
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 24px;font-size:16px;line-height:1.6;">
                            <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;">Reset your password</h1>
                            <p style="margin:0 0 8px;">Hi {{ $name }},</p>
                            <p style="margin:0 0 20px;">Use the link below to choose a new password for your SkillPath AI account.</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
                                <tr>
                                    <td bgcolor="#3c61a0" style="border-radius:8px;">
                                        <a href="{{ $resetUrl }}" style="display:inline-block;padding:12px 22px;color:#ffffff;text-decoration:none;font-weight:bold;">Reset password</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 8px;">This link expires in <strong>{{ $expiresIn }} minutes</strong>.</p>
                            <p style="margin:0 0 16px;color:#56657b;font-size:14px;">If you didn’t request a password reset, you can ignore this email.</p>
                            <p style="margin:0;color:#56657b;font-size:13px;">
                                If the button doesn’t work, copy and paste this link into your browser.<br>
                                <a href="{{ $resetUrl }}" style="color:#3c61a0;word-break:break-all;">{{ $resetUrl }}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
