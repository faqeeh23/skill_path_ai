<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('access-student', function (User $user) {
            return $user->role === 'student';
        });
        
        Gate::define('access-instructor', function (User $user) {
            return $user->role === 'instructor';
        });
        
        Gate::define('access-admin', function (User $user) {
            return $user->isActive() && $user->role === 'admin';
        });
        $resetUrl = static function (User $user, string $token): string {
            $query = http_build_query([
                'token' => $token,
                'email' => $user->email,
            ]);

            return rtrim(config('app.frontend_url'), '/').'/reset-password?'.$query;
        };

        ResetPassword::createUrlUsing($resetUrl);
        ResetPassword::toMailUsing(function (User $user, string $token) use ($resetUrl): MailMessage {
            $url = $resetUrl($user, $token);

            return (new MailMessage)
                ->subject('SkillPath AI - Reset your password')
                ->action('Reset password', $url)
                ->view([
                    'html' => 'emails.reset-password',
                    'text' => 'emails.reset-password-text',
                ], [
                    'name' => $user->name,
                    'resetUrl' => $url,
                    'expiresIn' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
                ]);
        });
    }
}
