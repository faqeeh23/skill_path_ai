<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('path_skills', function (Blueprint $table) {
            $table->unsignedBigInteger('path_id');
            $table->unsignedBigInteger('skill_id');
            $table->decimal('importance_score', 5, 4)->default(1);
            $table->decimal('target_mastery', 5, 4)->default(0.7);

            $table->primary(['path_id', 'skill_id']);
            $table->index('skill_id');

            $table->foreign('path_id')->references('id')->on('paths')->cascadeOnDelete();
            $table->foreign('skill_id')->references('id')->on('skills');
        });
        SchemaChecks::add('path_skills', [
            'chk_ps_importance' => 'importance_score >= 0 AND importance_score <= 1',
            'chk_ps_target' => 'target_mastery >= 0 AND target_mastery <= 1',
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('path_skills');
    }
};
