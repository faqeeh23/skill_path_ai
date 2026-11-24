<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class PathSkill extends Pivot
{
    protected $table = 'path_skills';

    public $timestamps = false;

    protected $fillable = [
        'path_id',
        'skill_id',
        'importance_score',
        'target_mastery',
    ];

    protected function casts(): array
    {
        return [
            'importance_score' => 'decimal:4',
            'target_mastery' => 'decimal:4',
        ];
    }

    public function path(): BelongsTo
    {
        return $this->belongsTo(Path::class);
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }
}
