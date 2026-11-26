<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class OtpService
{
    private const EXPIRATION_MINUTES = 10;
    private const MAX_ATTEMPTS = 5;
    private const RESEND_SECONDS = 60;
    private const MAX_SENDS_PER_HOUR = 5;

    public function generate(string $key, array $data = []): string
    {
        $resendKey = "{$key}:resend";
        $limitKey = "{$key}:send_limit";

        if (RateLimiter::tooManyAttempts($resendKey, 1)
            || RateLimiter::tooManyAttempts($limitKey, self::MAX_SENDS_PER_HOUR)) {
            abort(429, 'Please wait before requesting another code.');
        }

        $code = (string) random_int(100000, 999999);
        $expiresAt = now()->addMinutes(self::EXPIRATION_MINUTES);

        Cache::put($key, [
            'data' => $data,
            'hash' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => $expiresAt->timestamp,
        ], $expiresAt);

        RateLimiter::hit($resendKey, self::RESEND_SECONDS);
        RateLimiter::hit($limitKey, 3600);

        return $code;
    }

    public function verify(string $key, string $code): array
    {
        $otp = Cache::get($key);
        $remainingSeconds = ($otp['expires_at'] ?? 0) - now()->timestamp;

        if ($remainingSeconds <= 0 || ! isset($otp['data'])) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired verification code.'],
            ]);
        }

        if ($otp['attempts'] >= self::MAX_ATTEMPTS) {
            abort(429, 'Too many attempts. Request a new code.');
        }

        if (! Hash::check($code, $otp['hash'])) {
            $otp['attempts']++;
            Cache::put($key, $otp, $remainingSeconds);

            throw ValidationException::withMessages([
                'code' => ['Incorrect verification code.'],
            ]);
        }

        return $otp['data'];
    }

    public function forget(string $key): void
    {
        Cache::forget($key);
    }
}
