<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Enrollment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'path_id',
        'status',
        'enrolled_at',
    ];

    protected $hidden = ['active_user_id'];

    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function path(): BelongsTo
    {
        return $this->belongsTo(Path::class);
    }

    public function pathItems(): HasMany
    {
        return $this->hasMany(PathItem::class)
            ->orderBy('sequence')->orderBy('id');
    }

    public function quizSubmissions(): HasMany
    {
        return $this->hasMany(QuizSubmission::class);
    }

    public function project(): HasOne
    {
        return $this->hasOne(Project::class);
    }
}
