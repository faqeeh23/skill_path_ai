<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'enrollment_id',
        'title',
        'description',
        'status',
        'ai_feedback',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ProjectSubmission::class);
    }
}
