<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Path extends Model
{
    protected $fillable = [
        'career_goal_id',
        'title',
        'slug',
        'description',
        'thumbnail_url',
        'project_guide_lesson_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function careerGoal(): BelongsTo
    {
        return $this->belongsTo(CareerGoal::class);
    }

    public function projectGuideLesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'path_skills')
            ->using(PathSkill::class)->withPivot('importance_score', 'target_mastery');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }
}
