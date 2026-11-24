<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paths', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('career_goal_id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->unsignedBigInteger('project_guide_lesson_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->index('career_goal_id');

            $table->foreign('career_goal_id')->references('id')->on('career_goals');
            $table->foreign('project_guide_lesson_id')->references('id')->on('lessons')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paths');
    }
};
