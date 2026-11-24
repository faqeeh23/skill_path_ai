<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('path_id')->nullable();
            $table->unsignedBigInteger('skill_id')->nullable();
            $table->string('title');
            $table->integer('passing_score')->default(70);
            $table->integer('time_limit_minutes')->nullable();
            $table->integer('max_attempts')->nullable();
            $table->string('source', 20)->default('manual');
            $table->string('status', 20)->default('draft');
            $table->unsignedBigInteger('source_lesson_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->index(['path_id', 'status']);
            $table->index(['skill_id', 'status']);
            $table->index('source_lesson_id');

            $table->foreign('path_id')->references('id')->on('paths');
            $table->foreign('skill_id')->references('id')->on('skills');
            $table->foreign('source_lesson_id')->references('id')->on('lessons')->nullOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users');
        });
        SchemaChecks::add('quizzes', [
            'chk_quiz_target' => '(path_id IS NOT NULL AND skill_id IS NULL) OR (path_id IS NULL AND skill_id IS NOT NULL)',
            'chk_quiz_passing' => 'passing_score BETWEEN 0 AND 100',
            'chk_quiz_time' => 'time_limit_minutes IS NULL OR time_limit_minutes > 0',
            'chk_quiz_attempts' => 'max_attempts IS NULL OR max_attempts > 0',
            'chk_quiz_ai_reviewed' => "source = 'manual' OR status = 'draft' OR reviewed_by IS NOT NULL",
            'chk_quiz_source' => "source IN ('manual','ai')",
            'chk_quiz_status' => "status IN ('draft','published','archived')",
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
