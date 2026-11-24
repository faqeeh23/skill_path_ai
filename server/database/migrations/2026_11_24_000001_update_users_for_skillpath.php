<?php

use App\Support\SchemaChecks;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('password', 'password_hash');
            $table->string('name', 100)->change();
            $table->string('role', 20)->default('student');
        });

        // Keep existing timestamps and backfill only rows created without them.
        DB::table('users')->whereNull('created_at')->update(['created_at' => DB::raw('CURRENT_TIMESTAMP')]);
        DB::table('users')->whereNull('updated_at')->update(['updated_at' => DB::raw('CURRENT_TIMESTAMP')]);

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('created_at')->useCurrent()->change();
            $table->timestamp('updated_at')->useCurrent()->change();
        });

        SchemaChecks::add('users', [
            'chk_users_role' => "role IN ('student','instructor','admin')",
        ]);
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('DROP TRIGGER chk_users_role_insert');
            DB::statement('DROP TRIGGER chk_users_role_update');
        } else {
            // MySQL and MariaDB use different syntax for dropping a check.
            $dropCheck = DB::connection()->isMaria() ? 'DROP CONSTRAINT' : 'DROP CHECK';
            DB::statement("ALTER TABLE users {$dropCheck} chk_users_role");
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
            $table->renameColumn('password_hash', 'password');
            $table->string('name')->change();
            $table->timestamp('created_at')->nullable()->change();
            $table->timestamp('updated_at')->nullable()->change();
        });
    }
};
