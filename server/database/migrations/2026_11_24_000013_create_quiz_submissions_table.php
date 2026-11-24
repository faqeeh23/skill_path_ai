<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('enrollment_id');
            $table->unsignedBigInteger('quiz_id');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('submitted_at')->nullable();

            $table->index(['enrollment_id', 'quiz_id', 'started_at']);
            $table->index('quiz_id');

            $table->foreign('enrollment_id')->references('id')->on('enrollments')->cascadeOnDelete();
            $table->foreign('quiz_id')->references('id')->on('quizzes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_submissions');
    }
};
