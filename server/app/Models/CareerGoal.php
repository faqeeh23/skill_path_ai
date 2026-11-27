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
        'icon_url',
        'icon_public_id',
    ];

    protected $hidden = [
        'icon_public_id',
    ];

    public function paths(): HasMany
    {
        return $this->hasMany(Path::class);
    }
}
