<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Services\EmailVerificationService;

use Illuminate\Support\Facades\Route;
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $attributes = ['role' => 'student'];

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'password',
        'tow_factor_secret',
        'tow_factor_recovery_codes',
        'google_id',
    ];

    protected $hidden = ['password_hash', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }

    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    protected function password(): Attribute
    {
        // Keep existing Laravel callers and factories compatible with the renamed column.
        return Attribute::make(
            get: fn (): ?string => $this->password_hash,
            set: fn (string $value): array => [
                'password_hash' => $this->castAttributeAsHashedString('password_hash', $value),
            ],
        );
    }

    public function instructedLessons(): HasMany
    {
        return $this->hasMany(Lesson::class, 'instructor_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function tutorMessages(): HasMany
    {
        return $this->hasMany(TutorMessage::class);
    }

    public function createdQuizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'created_by');
    }

    public function reviewedQuizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'reviewed_by');
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'user_skills')
            ->using(UserSkill::class)->withPivot('mastery_score', 'updated_at');
    }
    public function sendEmailVerificationNotification(): void
    {
        app(EmailVerificationService::class)->send($this);
    }
}
