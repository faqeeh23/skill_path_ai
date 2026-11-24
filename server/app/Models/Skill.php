<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Skill extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Skill::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Skill::class, 'parent_id');
    }

    public function paths(): BelongsToMany
    {
        return $this->belongsToMany(Path::class, 'path_skills')
            ->using(PathSkill::class)->withPivot('importance_score', 'target_mastery');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_skills')
            ->using(UserSkill::class)->withPivot('mastery_score', 'updated_at');
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }

    public function quizQuestions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }
}
