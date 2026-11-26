<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailChanged extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('SkillPath AI - Security Alert')
            ->view([
                'html' => 'emails.email-changed',
                'text' => 'emails.email-changed-text',
            ]);
    }
}
