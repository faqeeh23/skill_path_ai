<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_link_changes_the_password_and_can_only_be_used_once(): void
    {
        Notification::fake();
        config(['app.frontend_url' => 'http://localhost:5173']);
        $user = User::factory()->create(['password' => 'OldPassword123!']);

        $this->postJson('/forgot-password', ['email' => $user->email])->assertOk();
        $notification = Notification::sent($user, ResetPassword::class)->sole();
        $message = $notification->toMail($user);
        $url = $message->actionUrl;
        $this->assertStringContainsString('href="'.e($url).'"', (string) $message->render());
        $this->assertStringContainsString($url, view($message->view['text'], $message->viewData)->render());
        $this->assertStringStartsWith('http://localhost:5173/reset-password?', $url);
        parse_str(parse_url($url, PHP_URL_QUERY), $query);
        $this->assertSame($user->email, $query['email']);
        $this->assertSame($notification->token, $query['token']);

        $payload = [
            'email' => $query['email'],
            'token' => $query['token'],
            'password' => 'NewPassword123!',
            'password_confirmation' => 'DifferentPassword123!',
        ];
        $this->postJson('/reset-password', $payload)->assertUnprocessable()->assertJsonValidationErrors('password');

        $payload['password_confirmation'] = $payload['password'];
        $this->postJson('/reset-password', $payload)->assertOk();
        $this->postJson('/reset-password', $payload)->assertUnprocessable();

        $this->postJson('/login', ['email' => $user->email, 'password' => 'OldPassword123!'])->assertUnprocessable();
        $this->postJson('/login', ['email' => $user->email, 'password' => $payload['password']])->assertOk();
        $this->assertAuthenticatedAs($user);
    }
}
