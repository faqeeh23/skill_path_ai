<?php

namespace Tests\Feature;

use App\Models\CareerGoal;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Mockery\MockInterface;
use RuntimeException;
use Tests\TestCase;

class CareerGoalIconsTest extends TestCase
{
    use RefreshDatabase;

    private const ENDPOINT = '/api/admin/career-goals';
    private const REACT_ICON = 'react/react-original.svg';
    private const LARAVEL_ICON = 'laravel/laravel-original.svg';
    private const BASE_URL = 'https://cdn.jsdelivr.net/npm/devicon@2.18.0/icons/';

    public function test_admin_can_create_and_switch_icon_sources(): void
    {
        $this->mock(CloudinaryService::class, function (MockInterface $mock) {
            $mock->shouldReceive('uploadImage')->twice()->andReturn(
                ['url' => 'https://example.test/old.png', 'public_id' => 'old-icon'],
                ['url' => 'https://example.test/new.png', 'public_id' => 'new-icon'],
            );
            $mock->shouldReceive('deleteImage')->once()->with('old-icon');
            $mock->shouldReceive('deleteImage')->once()->with('new-icon');
        });
        $this->actingAs(User::factory()->create(['role' => 'admin']));

        $this->postJson(self::ENDPOINT, ['name' => 'No icon', 'icon_mode' => 'keep'])
            ->assertCreated()->assertJsonPath('icon_url', null);
        $this->postJson(self::ENDPOINT, ['name' => 'Library', 'icon_mode' => 'library', 'icon_key' => self::REACT_ICON])
            ->assertCreated()->assertJsonPath('icon_url', self::BASE_URL.self::REACT_ICON);
        $file = fn () => UploadedFile::fake()->create('icon.png', 5, 'image/png');
        $goal = $this->post(self::ENDPOINT, ['name' => 'Custom', 'icon_mode' => 'upload', 'icon' => $file()], ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('icon_url', 'https://example.test/old.png')->assertJsonMissingPath('icon_public_id');
        $url = self::ENDPOINT.'/'.$goal->json('id');

        $this->putJson($url, ['name' => 'Renamed', 'icon_mode' => 'keep'])
            ->assertOk()->assertJsonPath('icon_url', 'https://example.test/old.png');
        foreach ([self::REACT_ICON, self::LARAVEL_ICON] as $key) {
            $this->putJson($url, ['name' => 'Renamed', 'icon_mode' => 'library', 'icon_key' => $key])
                ->assertOk()->assertJsonPath('icon_url', self::BASE_URL.$key)->assertJsonMissingPath('icon_public_id');
            $this->assertDatabaseHas('career_goals', ['id' => $goal->json('id'), 'icon_public_id' => null]);
        }
        $this->post($url, ['_method' => 'PUT', 'name' => 'Renamed', 'icon_mode' => 'upload', 'icon' => $file()], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('icon_url', 'https://example.test/new.png')->assertJsonMissingPath('icon_public_id');
        $this->putJson($url, ['name' => 'Renamed', 'icon_mode' => 'remove'])
            ->assertOk()->assertJsonPath('icon_url', null);
    }

    public function test_invalid_icons_and_failed_upload_preserve_the_saved_icon(): void
    {
        $this->mock(CloudinaryService::class, function (MockInterface $mock) {
            $mock->shouldReceive('uploadImage')->once()->andThrow(new RuntimeException('Simulated upload failure'));
            $mock->shouldNotReceive('deleteImage');
        });
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $goal = CareerGoal::create([
            'name' => 'Existing', 'slug' => 'existing',
            'icon_url' => 'https://example.test/original.png', 'icon_public_id' => 'original',
        ]);
        $url = self::ENDPOINT.'/'.$goal->id;

        $this->putJson($url, ['name' => 'Existing', 'icon_mode' => 'library', 'icon_key' => 'unknown'])
            ->assertUnprocessable()->assertJsonValidationErrors('icon_key');
        $this->putJson($url, ['name' => 'Existing', 'icon_mode' => 'unknown'])
            ->assertUnprocessable()->assertJsonValidationErrors('icon_mode');
        $this->post($url, [
            '_method' => 'PUT', 'name' => 'Changed', 'icon_mode' => 'upload',
            'icon' => UploadedFile::fake()->create('icon.png', 5, 'image/png'),
        ], ['Accept' => 'application/json'])->assertServerError();
        $this->assertSame('original', $goal->fresh()->icon_public_id);
        $this->assertSame('Existing', $goal->fresh()->name);
    }
}
