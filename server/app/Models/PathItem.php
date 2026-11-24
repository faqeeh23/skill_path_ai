<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PathItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'enrollment_id',
        'lesson_id',
        'sequence',
        'source',
        'reason',
        'trigger_submission_id',
        'last_position_seconds',
        'last_accessed_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'last_accessed_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function triggerSubmission(): BelongsTo
    {
        return $this->belongsTo(QuizSubmission::class);
    }
}
