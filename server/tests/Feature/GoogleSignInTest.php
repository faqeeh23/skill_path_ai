<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Two\User as GoogleUser;
use Tests\TestCase;

class GoogleSignInTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_google_account_can_sign_in_again_without_a_duplicate_user(): void
    {
        config(['app.frontend_url' => 'http://localhost:5173']);
        $this->mockGoogleProfile('student@example.com');

        $this->get('/auth/google/callback?code=test')->assertRedirect('http://localhost:5173/dashboard');
        $user = User::where('google_id', 'google-subject')->sole();
        $this->assertTrue($user->hasVerifiedEmail());
        $this->assertAuthenticatedAs($user);

        $this->postJson('/logout')->assertNoContent();
        $this->get('/auth/google/callback?code=second')->assertRedirect('http://localhost:5173/dashboard');
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_a_matching_password_account_is_not_automatically_linked(): void
    {
        config(['app.frontend_url' => 'http://localhost:5173']);
        $user = User::factory()->create();
        $this->mockGoogleProfile($user->email);

        $this->get('/auth/google/callback?code=test')
            ->assertRedirect('http://localhost:5173/login?google_error=account_exists');
        $this->assertGuest();
        $this->assertNull($user->fresh()->google_id);
    }

    public function test_invalid_oauth_state_returns_to_login(): void
    {
        config(['app.frontend_url' => 'http://localhost:5173']);
        Socialite::shouldReceive('driver')->with('google')->andReturnSelf();
        Socialite::shouldReceive('user')->andThrow(new InvalidStateException);

        $this->get('/auth/google/callback?code=test')
            ->assertRedirect('http://localhost:5173/login?google_error=sign_in_failed');
        $this->assertGuest();
    }

    private function mockGoogleProfile(string $email): void
    {
        $profile = (new GoogleUser)->setRaw(['email_verified' => true])
            ->map(['id' => 'google-subject', 'email' => $email, 'name' => 'Google Student']);
        Socialite::shouldReceive('driver')->with('google')->andReturnSelf();
        Socialite::shouldReceive('user')->andReturn($profile);
    }
}
