<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailCode extends Notification
{
    public function __construct(
        private string $code
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('SkillPath AI - Email Verification')
            ->view([
                'html' => 'emails.verify-email-code',
                'text' => 'emails.verify-email-code-text',
            ], [
                'name' => $notifiable->name ?? 'there',
                'code' => $this->code,
            ]);
    }
}
