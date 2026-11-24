<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('path_id');
            $table->string('status', 20)->default('active');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->unsignedBigInteger('active_user_id')
                ->nullable()
                ->virtualAs("CASE WHEN status = 'active' THEN user_id ELSE NULL END");

            $table->unique(['user_id', 'path_id']);
            $table->index('path_id');
            $table->unique('active_user_id');

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('path_id')->references('id')->on('paths');
        });
        SchemaChecks::add('enrollments', [
            'chk_enrollment_status' => "status IN ('active','paused')",
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
