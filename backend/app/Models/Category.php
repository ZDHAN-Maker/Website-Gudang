<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute; 
use Illuminate\Support\Facades\Storage;

class Category extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'photo', 'tagline'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Accessor gaya modern (Lebih clean)
    protected function photo(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? url(Storage::url($value)) : null,
        );
    }
}