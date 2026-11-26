<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class EmailVerificationService
{
    public function __construct(private OtpService $otp) {}

    public function send(User $user): void
    {
        $key = "email_otp:{$user->id}";

        Cache::lock("email_otp_lock:{$user->id}", 60)
            ->block(5, function () use ($user, $key) {
                $user->refresh();

                if ($user->hasVerifiedEmail()) {
                    return;
                }

                $code = $this->otp->generate($key, ['email' => $user->email]);
                $user->notify(new VerifyEmailCode($code));
            });
    }

    public function verify(User $user, string $code): void
    {
        $key = "email_otp:{$user->id}";

        Cache::lock("email_otp_lock:{$user->id}", 60)
            ->block(5, function () use ($user, $code, $key) {
                $user->refresh();

                if ($user->hasVerifiedEmail()) {
                    return;
                }

                $data = $this->otp->verify($key, $code);

                if (($data['email'] ?? null) !== $user->email) {
                    throw ValidationException::withMessages([
                        'code' => ['Invalid or expired verification code.'],
                    ]);
                }

                if ($user->markEmailAsVerified()) {
                    $this->otp->forget($key);

                    event(new Verified($user));
                }
            });
    }
}
