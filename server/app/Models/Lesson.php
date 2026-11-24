<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    protected $fillable = [
        'skill_id',
        'instructor_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'duration_seconds',
        'transcript',
        'summary',
        'difficulty_level',
        'processing_status',
        'status',
    ];

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function guidedPaths(): HasMany
    {
        return $this->hasMany(Path::class, 'project_guide_lesson_id');
    }

    public function pathItems(): HasMany
    {
        return $this->hasMany(PathItem::class);
    }

    public function tutorMessages(): HasMany
    {
        return $this->hasMany(TutorMessage::class);
    }

    public function generatedQuizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'source_lesson_id');
    }
}
