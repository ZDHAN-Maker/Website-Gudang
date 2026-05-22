<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'thumbnail', 'about', 'price', 'category_id', 'is_popular'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function merchant()
    {
        return $this->belongsToMany(Merchant::class, 'merchant_products')
            ->withPivot('stock')
            ->withTimestamps();
    }

    public function warehouse()
    {
        return $this->belongsToMany(Warehouse::class, 'warehouse_products')
            ->withPivot('stock')
            ->withTimestamps();
    }

    public function transaction()
    {
        return $this->hasMany(TransactionProduct::class);
    }

    public function getWarehouseProductStock()
    {
        if ($this->relationLoaded('warehouse')) {
            return $this->warehouse->sum('pivot.stock');
        }
        // Pastikan di sini juga pakai 's' jika kamu tidak pakai eager loading
        return $this->warehouse()->sum('warehouse_products.stock');
    }

    public function getMerchantProductStock()
    {
        if ($this->relationLoaded('merchant')) {
            return $this->merchant->sum('pivot.stock');
        }
        // Pastikan di sini juga pakai 's'
        return $this->merchant()->sum('merchant_products.stock');
    }

    protected function thumbnail(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? url(Storage::url($value)) : null,
        );
    }
}
