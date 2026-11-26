<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\EmailChanged;
use App\Notifications\VerifyEmailCode;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Throwable;

class EmailChangeService
{
    public function __construct(private OtpService $otp) {}

    public function send(User $user, string $newEmail): void
    {
        $key = "email_change_otp:{$user->id}";

        Cache::lock("{$key}:lock", 60)->block(5, function () use ($user, $newEmail, $key) {
            $user->refresh();

            if ($user->email === $newEmail) {
                throw ValidationException::withMessages([
                    'email' => ['This is your current email.'],
                ]);
            }

            if (User::where('email', $newEmail)->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['This email is unavailable.'],
                ]);
            }

            $code = $this->otp->generate($key, [
                'current_email' => $user->email,
                'new_email' => $newEmail,
            ]);

            try {
                Notification::route('mail', $newEmail)->notify(new VerifyEmailCode($code));
            } catch (Throwable $error) {
                $this->otp->forget($key);

                throw $error;
            }
        });
    }

    public function verify(User $user, string $code): void
    {
        $key = "email_change_otp:{$user->id}";

        $oldEmail = Cache::lock("{$key}:lock", 60)->block(5, function () use ($user, $code, $key): string {
            $data = $this->otp->verify($key, $code);

            try {
                DB::transaction(function () use ($user, $data) {
                    $currentUser = User::query()->lockForUpdate()->findOrFail($user->id);

                    if ($currentUser->email !== $data['current_email']) {
                        throw ValidationException::withMessages([
                            'code' => ['Invalid verification request.'],
                        ]);
                    }

                    if (User::where('email', $data['new_email'])->whereKeyNot($currentUser->id)->exists()) {
                        throw ValidationException::withMessages([
                            'email' => ['This email is unavailable.'],
                        ]);
                    }

                    $currentUser->forceFill([
                        'email' => $data['new_email'],
                        'email_verified_at' => now(),
                    ])->saveOrFail();

                    $broker = config('auth.defaults.passwords');
                    DB::table(config("auth.passwords.{$broker}.table"))
                        ->whereIn('email', [$data['current_email'], $data['new_email']])
                        ->delete();
                });
            } catch (UniqueConstraintViolationException) {
                throw ValidationException::withMessages([
                    'email' => ['This email is unavailable.'],
                ]);
            }

            $this->otp->forget($key);
            $user->refresh();

            return $data['current_email'];
        });

        try {
            Notification::route('mail', $oldEmail)->notify(new EmailChanged());
        } catch (Throwable $error) {
            Log::warning('Email change security notification failed.', [
                'user_id' => $user->id,
                'exception' => get_class($error),
            ]);
        }
    }
}
