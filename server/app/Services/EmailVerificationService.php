<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class EmailVerificationService
{
    public function send(User $user): void
    {
        Cache::lock("email_otp_lock:{$user->id}", 60)
            ->block(5, function () use ($user) {

                $user->refresh();

                if ($user->hasVerifiedEmail()) {
                    return;
                }

                $key = "email_otp:{$user->id}";
                $resendKey = "email_otp_resend:{$user->id}";
                $limitKey = "email_otp_send_limit:{$user->id}";

                if (
                    RateLimiter::tooManyAttempts($resendKey, 1) ||
                    RateLimiter::tooManyAttempts($limitKey, 5)
                ) {
                    abort(429, 'Please wait before requesting another code.');
                }

                $code = (string) random_int(100000, 999999);

                Cache::put($key, [
                    'hash' => Hash::make($code),
                    'email' => $user->email,
                    'attempts' => 0,
                    'expires_at' => now()->addMinutes(10)->timestamp,
                ], now()->addMinutes(10));

                RateLimiter::hit($resendKey, 60);
                RateLimiter::hit($limitKey, 3600);

                $user->notify(new VerifyEmailCode($code));
            });
    }

    public function verify(User $user, string $code): void
    {
        Cache::lock("email_otp_lock:{$user->id}", 60)
            ->block(5, function () use ($user, $code) {

                $user->refresh();

                if ($user->hasVerifiedEmail()) {
                    return;
                }

                $key = "email_otp:{$user->id}";
                $data = Cache::get($key);

                if (
                    !$data ||
                    $data['email'] !== $user->email ||
                    $data['expires_at'] <= now()->timestamp
                ) {
                    throw ValidationException::withMessages([
                        'code' => ['Invalid or expired verification code.'],
                    ]);
                }

                if ($data['attempts'] >= 5) {
                    abort(429, 'Too many attempts. Request a new code.');
                }

                if (!Hash::check($code, $data['hash'])) {

                    $data['attempts']++;

                    Cache::put(
                        $key,
                        $data,
                        max(1, $data['expires_at'] - now()->timestamp)
                    );

                    throw ValidationException::withMessages([
                        'code' => ['Incorrect verification code.'],
                    ]);
                }

                if ($user->markEmailAsVerified()) {
                    Cache::forget($key);

                    event(new Verified($user));
                }
            });
    }
}