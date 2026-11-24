<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_skills', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('skill_id');
            $table->decimal('mastery_score', 5, 4)->default(0);
            $table->timestamp('updated_at')->useCurrent();

            $table->primary(['user_id', 'skill_id']);
            $table->index('skill_id');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('skill_id')->references('id')->on('skills');
        });
        SchemaChecks::add('user_skills', [
            'chk_us_mastery' => 'mastery_score >= 0 AND mastery_score <= 1',
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('user_skills');
    }
};
