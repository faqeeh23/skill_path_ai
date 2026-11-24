<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAnswer extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'submission_id',
        'question_id',
        'option_id',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(QuizSubmission::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class);
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(QuestionOption::class);
    }
}
