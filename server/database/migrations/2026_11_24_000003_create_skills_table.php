<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('name', 150);
            $table->string('slug', 150)->unique();

            $table->index('parent_id');

            $table->foreign('parent_id')->references('id')->on('skills');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};
