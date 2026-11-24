<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('repo_url');
            $table->char('commit_sha', 40)->nullable();
            $table->string('status', 20)->default('queued');
            $table->boolean('build_passed')->nullable();
            $table->boolean('tests_passed')->nullable();
            $table->json('skill_results')->nullable();
            $table->text('ai_summary')->nullable();
            $table->longText('logs')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();

            $table->index(['project_id', 'submitted_at']);

            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
        });
        SchemaChecks::add('project_submissions', [
            'chk_submission_status' => "status IN ('queued','running','evaluated','error')",
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('project_submissions');
    }
};
