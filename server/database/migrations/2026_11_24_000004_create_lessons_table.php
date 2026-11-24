<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('skill_id');
            $table->unsignedBigInteger('instructor_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('video_url')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->longText('transcript')->nullable();
            $table->text('summary')->nullable();
            $table->string('difficulty_level', 20)->nullable();
            $table->string('processing_status', 20)->default('uploaded');
            $table->string('status', 20)->default('draft');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->index(['skill_id', 'status']);
            $table->index(['instructor_id', 'status']);

            $table->foreign('skill_id')->references('id')->on('skills');
            $table->foreign('instructor_id')->references('id')->on('users');
        });
        SchemaChecks::add('lessons', [
            'chk_lesson_difficulty' => "difficulty_level IS NULL OR difficulty_level IN ('beginner','intermediate','advanced')",
            'chk_lesson_processing' => "processing_status IN ('uploaded','transcribing','ready','failed')",
            'chk_lesson_status' => "status IN ('draft','published','archived')",
            'chk_lesson_publish' => "status <> 'published' OR processing_status = 'ready'",
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
