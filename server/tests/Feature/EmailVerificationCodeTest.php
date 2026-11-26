<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
    }
}
