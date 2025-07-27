<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use SoftDeletes;
    protected $fillable =['name', 'thumbnail', 'about','price' , 'category_id',' is_popular'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function merchant()
    {
        return $this->belongsToMany(Merchant::class, 'merchant_product')
                    ->withPivot('stock')
                    ->withTimestamps();
    }

    public function warehouse()
    {
        return $this->belongsToMany(Warehouse::class,'warehouse_product')
                    ->withPivot('stock')
                    ->withTimestamps();
    }

    public function transaction()
    {
        return $this->hasMany(TransactionProduct::class);
    }

    public function getWarehouseProductStock()
    {
        return $this->warehouse()->sum('stock');
    }

    public function getMerchantProductStock()
    {
        return $this->merchants()->sum('stock');
    }

    public function getThumbnailAttribut($value)
    {
        if (!$value)
        {
            return null; //no image avaiulable
        }
        return url(Storage::url($value)); 
    }
}
