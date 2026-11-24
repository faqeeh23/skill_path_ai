<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('question_id');
            $table->text('text');
            $table->boolean('is_correct')->default(false);
            $table->unsignedTinyInteger('position');

            $table->unique(['question_id', 'position']);
            $table->unique(['question_id', 'id']);

            $table->foreign('question_id')->references('id')->on('quiz_questions')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_options');
    }
};
