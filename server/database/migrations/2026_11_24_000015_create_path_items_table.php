<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('path_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('enrollment_id');
            $table->unsignedBigInteger('lesson_id');
            $table->unsignedInteger('sequence');
            $table->string('source', 20)->default('placement');
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('trigger_submission_id')->nullable();
            $table->unsignedInteger('last_position_seconds')->default(0);
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->unique(['enrollment_id', 'lesson_id']);
            $table->index(['enrollment_id', 'sequence']);
            $table->index('lesson_id');
            $table->index('trigger_submission_id');

            $table->foreign('enrollment_id')->references('id')->on('enrollments')->cascadeOnDelete();
            $table->foreign('lesson_id')->references('id')->on('lessons');
            $table->foreign('trigger_submission_id')->references('id')->on('quiz_submissions')->nullOnDelete();
        });
        SchemaChecks::add('path_items', [
            'chk_pi_source' => "source IN ('placement','remedial','project_guide')",
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('path_items');
    }
};
