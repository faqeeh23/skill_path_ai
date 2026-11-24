<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('quiz_id');
            $table->unsignedBigInteger('skill_id');
            $table->text('text');
            $table->text('explanation')->nullable();
            $table->integer('points')->default(1);
            $table->unsignedInteger('position');

            $table->unique(['quiz_id', 'position']);
            $table->index('skill_id');

            $table->foreign('quiz_id')->references('id')->on('quizzes')->cascadeOnDelete();
            $table->foreign('skill_id')->references('id')->on('skills');
        });
        SchemaChecks::add('quiz_questions', [
            'chk_qq_points' => 'points > 0',
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_questions');
    }
};
