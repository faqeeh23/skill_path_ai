<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SchemaChecks
{
    public static function add(string $table, array $checks): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            $constraints = [];

            foreach ($checks as $name => $expression) {
                $constraints[] = "ADD CONSTRAINT {$name} CHECK ({$expression})";
            }

            DB::statement("ALTER TABLE {$table} ".implode(', ', $constraints));

            return;
        }

        // SQLite cannot add a CHECK to an existing table.
        $columns = array_map(
            static fn (string $column): string => preg_quote($column, '/'),
            Schema::getColumnListing($table),
        );
        $columnPattern = "/'[^']*'(*SKIP)(*F)|\\b(".implode('|', $columns).')\\b/';

        foreach ($checks as $name => $expression) {
            $newRowExpression = preg_replace($columnPattern, 'NEW.$1', $expression);

            foreach (['INSERT', 'UPDATE'] as $event) {
                $trigger = $name.'_'.strtolower($event);

                DB::unprepared("
                    CREATE TRIGGER {$trigger} BEFORE {$event} ON {$table}
                    FOR EACH ROW WHEN NOT ({$newRowExpression})
                    BEGIN
                        SELECT RAISE(ABORT, '{$name}');
                    END
                ");
            }
        }
    }
}
