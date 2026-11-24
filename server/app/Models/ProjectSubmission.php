<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectSubmission extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'project_id',
        'repo_url',
        'commit_sha',
        'status',
        'build_passed',
        'tests_passed',
        'skill_results',
        'ai_summary',
        'logs',
        'submitted_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'build_passed' => 'boolean',
            'tests_passed' => 'boolean',
            'skill_results' => 'array',
            'submitted_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
