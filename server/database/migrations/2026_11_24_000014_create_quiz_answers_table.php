<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('submission_id');
            $table->unsignedBigInteger('question_id');
            $table->unsignedBigInteger('option_id')->nullable();

            $table->unique(['submission_id', 'question_id']);
            $table->index(['question_id', 'option_id']);

            $table->foreign('submission_id')->references('id')->on('quiz_submissions')->cascadeOnDelete();
            $table->foreign('question_id')->references('id')->on('quiz_questions');
            $table->foreign(['question_id', 'option_id'])->references(['question_id', 'id'])->on('question_options');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_answers');
    }
};
