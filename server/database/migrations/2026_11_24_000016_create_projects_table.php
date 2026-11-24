<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('enrollment_id')->unique();
            $table->string('title', 150);
            $table->text('description');
            $table->string('status', 20)->default('proposed');
            $table->text('ai_feedback')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('enrollment_id')->references('id')->on('enrollments')->cascadeOnDelete();
        });
        SchemaChecks::add('projects', [
            'chk_project_status' => "status IN ('proposed','needs_changes','approved')",
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
