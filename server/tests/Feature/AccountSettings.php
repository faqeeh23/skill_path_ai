<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\EmailChanged;
use App\Notifications\VerifyEmailCode;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AccountSettings extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_filter_users_and_update_another_account(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = User::factory()->create(['role' => 'instructor', 'is_active' => false]);
        $student = User::factory()->create();
        $url = '/api/admin/users';

        $this->getJson($url)->assertUnauthorized();
        $this->actingAs($student)->getJson($url)->assertForbidden();
        $this->actingAs($admin)->getJson($url.'?role=instructor&is_active=0')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $instructor->id)
            ->assertJsonMissingPath('data.0.password_hash');
        $this->getJson($url.'?is_active=0')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson($url.'?role=student')->assertOk()->assertJsonPath('data.0.id', $student->id);
        $this->getJson($url.'/'.$instructor->id)->assertOk()->assertJsonPath('is_active', false);

        $this->patchJson($url.'/'.$student->id, ['role' => 'instructor', 'is_active' => false])
            ->assertOk()->assertJsonPath('role', 'instructor')->assertJsonPath('is_active', false);
        $this->patchJson($url.'/'.$admin->id, ['is_active' => false])
            ->assertUnprocessable()->assertJsonValidationErrors('account');
        $this->assertTrue($admin->fresh()->isActive());
    }

    public function test_disabling_an_account_invalidates_its_existing_spa_session(): void
    {
        $user = User::factory()->create(['password' => 'CurrentPassword123!']);
        $this->withHeader('Origin', config('app.frontend_url'));
        $this->postJson('/login', ['email' => $user->email, 'password' => 'CurrentPassword123!'])->assertOk();
        $this->getJson('/api/user')->assertOk();

        $user->forceFill(['is_active' => false])->save();
        auth()->forgetGuards();

        $this->getJson('/api/user')->assertUnauthorized()
            ->assertJsonPath('message', 'Your account is inactive.');
        $this->assertGuest('web');
    }

    public function test_inactive_account_cannot_sign_in_with_its_password(): void
    {
        $user = User::factory()->create([
            'is_active' => false,
            'password' => 'CurrentPassword123!',
        ]);

        $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'CurrentPassword123!',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_email_change_requires_a_verified_session_and_recent_password_confirmation(): void
    {
        $this->withHeader('Origin', config('app.frontend_url'));
        $url = '/api/email/change/request';
        $payload = ['email' => 'new@example.com'];
        $this->postJson($url, $payload)->assertUnauthorized();

        $user = User::factory()->unverified()->create(['password' => 'CurrentPassword123!']);
        $this->actingAs($user)->postJson($url, $payload)->assertForbidden();
        $user->markEmailAsVerified();
        $this->postJson($url, $payload)->assertStatus(423);
        $this->postJson('/api/email/change/verify', ['code' => '123456'])->assertStatus(423);
        $this->postJson('/user/confirm-password', ['password' => 'WrongPassword'])->assertUnprocessable();
        $this->postJson($url, $payload)->assertStatus(423);
        $this->postJson('/user/confirm-password', ['password' => 'CurrentPassword123!'])->assertCreated();
        $this->postJson($url, ['email' => $user->email])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson($url, ['email' => User::factory()->create()->email])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_email_change_uses_a_single_use_code_sent_only_to_the_new_address(): void
    {
        $this->withHeader('Origin', config('app.frontend_url'));
        Notification::fake();
        $user = User::factory()->create();
        $oldEmail = $user->email;
        $newEmail = 'new@example.com';
        $this->actingAs($user)->withSession(['auth.password_confirmed_at' => now()->timestamp]);

        $this->postJson('/api/email/change/request', ['email' => $newEmail])->assertOk();
        $this->assertSame($oldEmail, $user->fresh()->email);
        $this->postJson('/api/email/change/request', ['email' => $newEmail])->assertTooManyRequests();
        Notification::assertCount(1);
        $code = null;
        Notification::assertSentOnDemand(VerifyEmailCode::class, function ($notification, $channels, $recipient) use ($newEmail, &$code) {
            $code = $notification->toMail($recipient)->viewData['code'];

            return $recipient->routes['mail'] === $newEmail;
        });

        $wrongCode = $code === '123456' ? '654321' : '123456';
        $url = '/api/email/change/verify';
        $this->postJson($url, ['code' => $wrongCode])->assertUnprocessable()->assertJsonValidationErrors('code');
        Notification::assertCount(1);
        $this->postJson($url, ['code' => $code])->assertOk();
        $this->assertSame($newEmail, $user->fresh()->email);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->postJson($url, ['code' => $code])->assertUnprocessable()->assertJsonValidationErrors('code');
        Notification::assertCount(2);
        Notification::assertSentOnDemand(EmailChanged::class, function ($notification, $channels, $recipient) use ($oldEmail) {
            $message = $notification->toMail($recipient);
            $this->assertStringContainsString('Your email address was changed', (string) $message->render());
            $this->assertStringContainsString('Your email address was changed', view($message->view['text'])->render());

            return $recipient->routes['mail'] === $oldEmail;
        });
    }

    public function test_security_alert_failure_does_not_fail_email_change(): void
    {
        $this->withoutExceptionHandling();
        $user = User::factory()->create();
        $oldEmail = $user->email;
        $newEmail = 'new@example.com';
        $code = app(OtpService::class)->generate("email_change_otp:{$user->id}", [
            'current_email' => $user->email,
            'new_email' => $newEmail,
        ]);
        Notification::shouldReceive('send')->once()->withArgs(
            fn ($recipient, $notification) => $recipient->routes['mail'] === $oldEmail
                && $notification instanceof EmailChanged
        )
            ->andThrow(new \RuntimeException('Mail service unavailable'));
        Log::shouldReceive('warning')->once()->with('Email change security notification failed.', [
            'user_id' => $user->id,
            'exception' => \RuntimeException::class,
        ]);

        $this->withHeader('Origin', config('app.frontend_url'))
            ->actingAs($user)->withSession(['auth.password_confirmed_at' => now()->timestamp]);
        $this->postJson('/api/email/change/verify', ['code' => $code])->assertOk();
        $this->assertSame($newEmail, $user->fresh()->email);
    }

    public function test_expired_email_change_code_is_rejected_after_password_is_confirmed_again(): void
    {
        $this->withHeader('Origin', config('app.frontend_url'));
        config(['auth.password_timeout' => 300]);
        Notification::fake();
        $user = User::factory()->create(['password' => 'CurrentPassword123!']);
        $this->actingAs($user)->withSession(['auth.password_confirmed_at' => now()->timestamp]);
        $this->postJson('/api/email/change/request', ['email' => 'new@example.com'])->assertOk();
        $code = null;
        Notification::assertSentOnDemand(VerifyEmailCode::class, function ($notification, $channels, $recipient) use (&$code) {
            $code = $notification->toMail($recipient)->viewData['code'];

            return true;
        });

        $this->travel(10)->minutes();
        $this->postJson('/api/email/change/verify', ['code' => $code])->assertStatus(423);
        $this->postJson('/user/confirm-password', ['password' => 'CurrentPassword123!'])->assertCreated();
        $this->postJson('/api/email/change/verify', ['code' => $code])
            ->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->assertSame($user->email, $user->fresh()->email);
    }

    public function test_profile_update_changes_only_the_display_name(): void
    {
        $user = User::factory()->create();

        $this->putJson('/user/profile-information', ['name' => 'New Name'])->assertUnauthorized();

        $this->actingAs($user)->putJson('/user/profile-information', ['name' => ''])
            ->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->putJson('/user/profile-information', [
            'name' => 'New Name',
            'email' => 'different@example.com',
        ])->assertOk();
        $this->getJson('/api/user')->assertOk()
            ->assertJsonPath('name', 'New Name')
            ->assertJsonPath('email', $user->email);
    }

    public function test_password_update_requires_the_current_password_and_matching_confirmation(): void
    {
        $user = User::factory()->create(['password' => 'OriginalPassword123!']);
        $payload = [
            'current_password' => 'IncorrectPassword123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ];

        $this->actingAs($user)->putJson('/user/password', $payload)
            ->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $payload['current_password'] = 'OriginalPassword123!';
        $this->putJson('/user/password', [...$payload, 'password_confirmation' => 'Mismatch123!'])
            ->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->putJson('/user/password', $payload)->assertOk();
        $this->assertTrue(Hash::check($payload['password'], $user->fresh()->getAuthPassword()));
        $this->assertFalse(Hash::check($payload['current_password'], $user->fresh()->getAuthPassword()));
    }
}
