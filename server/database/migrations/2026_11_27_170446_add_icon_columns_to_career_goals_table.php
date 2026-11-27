<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('career_goals', function (Blueprint $table) {
            $table->string('icon_url', 2048)->nullable();
            $table->string('icon_public_id', 255)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('career_goals', function (Blueprint $table) {
            $table->dropColumn(['icon_url', 'icon_public_id']);
        });
    }
};
