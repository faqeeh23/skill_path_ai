<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailVerificationCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_signed_in_user_can_request_and_verify_an_emailed_code(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->postJson('/api/email/verification-code', ['code' => '123456'])->assertUnauthorized();

        $this->actingAs($user)->postJson('/email/verification-notification')->assertAccepted();

        $notification = Notification::sent($user, VerifyEmailCode::class)->sole();
        $message = $notification->toMail($user);
        $code = $message->viewData['code'];
        $this->assertStringContainsString($code, (string) $message->render());
        $this->assertStringContainsString($code, view($message->view['text'], $message->viewData)->render());
        $incorrectCode = $code === '123456' ? '654321' : '123456';

        $this->postJson('/api/email/verification-code', ['code' => $incorrectCode])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());

        $this->postJson('/api/email/verification-code', ['code' => $code])->assertNoContent();
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->assertFalse(Cache::has("email_otp:{$user->id}"));
    }

    public function test_registration_sends_a_code_and_immediate_resend_is_blocked(): void
    {
        Notification::fake();

        $this->postJson('/register', [
            'name' => 'Student',
            'email' => 'student@example.com',
            'password' => 'StudentPassword123!',
            'password_confirmation' => 'StudentPassword123!',
        ])->assertCreated();

        $user = User::where('email', 'student@example.com')->sole();
        Notification::assertSentToTimes($user, VerifyEmailCode::class, 1);
        $this->postJson('/email/verification-notification')->assertTooManyRequests();
    }

    public function test_code_is_rejected_after_expiry_or_email_change(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $originalEmail = $user->email;
        $this->actingAs($user)->postJson('/email/verification-notification')->assertAccepted();
        $code = Notification::sent($user, VerifyEmailCode::class)->sole()->toMail($user)->viewData['code'];

        $user->update(['email' => 'changed@example.com']);
        $this->postJson('/api/email/verification-code', ['code' => $code])
            ->assertUnprocessable()->assertJsonValidationErrors('code');

        $user->update(['email' => $originalEmail]);
        $this->travel(10)->minutes();
        $this->postJson('/api/email/verification-code', ['code' => $code])
            ->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_five_wrong_codes_block_further_attempts(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();
        $this->actingAs($user)->postJson('/email/verification-notification')->assertAccepted();
        $code = Notification::sent($user, VerifyEmailCode::class)->sole()->toMail($user)->viewData['code'];
        $incorrectCode = $code === '123456' ? '654321' : '123456';

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/email/verification-code', ['code' => $incorrectCode])->assertUnprocessable();
        }

        $this->postJson('/api/email/verification-code', ['code' => $code])
            ->assertTooManyRequests()->assertJsonPath('message', 'Too many attempts. Request a new code.');
    }
}
