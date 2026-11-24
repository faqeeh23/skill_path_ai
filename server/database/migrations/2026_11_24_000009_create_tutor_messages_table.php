<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutor_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('lesson_id');
            $table->string('role', 20);
            $table->longText('content');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'lesson_id', 'created_at']);
            $table->index('lesson_id');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('lesson_id')->references('id')->on('lessons');
        });
        SchemaChecks::add('tutor_messages', [
            'chk_tutor_role' => "role IN ('user','assistant')",
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_messages');
    }
};
