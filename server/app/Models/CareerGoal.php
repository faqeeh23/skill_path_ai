<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CareerGoal extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function paths(): HasMany
    {
        return $this->hasMany(Path::class);
    }
}
