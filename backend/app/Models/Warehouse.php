<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Warehouse extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['name', 'address', 'photo', 'phone']; // Pastikan 'tagline' ditambah di sini dan di migrasi jika memang ingin digunakan

    public function products()
    {
        return $this->belongsToMany(Product::class, 'warehouse_products')
                    ->withPivot('stock') // DIUBAH: dari wherePivot ke withPivot
                    ->withTimestamps();
    }

    public function getPhotoAttribute($value)
    {
        if (!$value) {
            return null;
        }
        return url(Storage::url($value));
    } 
}