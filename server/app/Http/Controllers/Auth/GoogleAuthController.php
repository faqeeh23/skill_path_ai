<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Two\User as GoogleUser;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $frontend = rtrim(config('app.frontend_url'), '/');
        $failure = $frontend.'/login?google_error=sign_in_failed';

        if ($request->filled('error') || ! $request->filled('code')) {
            return redirect()->away($failure);
        }

        try {
            $profile = Socialite::driver('google')->user();
        } catch (InvalidStateException | GuzzleException) {
            return redirect()->away($failure);
        }

        if (! ($profile instanceof GoogleUser)) {
            return redirect()->away($failure);
        }

        $googleId = $profile->getId();
        $email = $profile->getEmail();
        if (! $googleId || ! $email || ($profile->getRaw()['email_verified'] ?? false) !== true) {
            return redirect()->away($failure);
        }

        $user = User::where('google_id', $googleId)->first();
        if (! $user) {
            try {
                $user = User::firstOrCreate(['google_id' => $googleId], [
                    'name' => $profile->getName() ?: $email,
                    'email' => $email,
                    'password' => Str::random(64),
                ]);
            } catch (UniqueConstraintViolationException) {
                return redirect()->away($frontend.'/login?google_error=account_exists');
            }
        }

        if (! $user->isActive()) {
            return redirect()->away($failure);
        }

        if (! $user->hasVerifiedEmail() && $user->email === $email) {
            $user->markEmailAsVerified();
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        $destination = match (true) {
            ! $user->hasVerifiedEmail() => '/verify-email',
            $user->role === 'student' => '/dashboard',
            $user->role === 'instructor' => '/instructor',
            $user->role === 'admin' => '/admin',
            default => '/',
        };

        return redirect()->away($frontend.$destination);
    }
}
