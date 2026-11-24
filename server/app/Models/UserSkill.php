<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class UserSkill extends Pivot
{
    protected $table = 'user_skills';

    protected $fillable = [
        'user_id',
        'skill_id',
        'mastery_score',
    ];

    protected function casts(): array
    {
        return [
            'mastery_score' => 'decimal:4',
            'updated_at' => 'datetime',
        ];
    }

    public function getCreatedAtColumn(): ?string
    {
        return null;
    }

    public function hasTimestampAttributes($attributes = null): bool
    {
        // This pivot tracks only updated_at.
        return true;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }
}
