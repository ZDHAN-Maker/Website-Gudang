<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * Spatie Permission guard name
     *
     * @var string
     */
    protected $guard_name = 'web';

    /**
     * Table name.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Accessor for photo attribute.
     */
    public function getPhotoAttribute($value)
    {
        return $value ? url(Storage::url($value)) : null;
    }

    /**
     * Relationship to Merchant model.
     */
    public function merchant()
    {
        return $this->hasOne(Merchant::class, 'keeper_id', 'id');
    }
    public static function boot()
    {
        parent::boot();

        static::retrieved(function ($model) {
            Log::info('User model uses table: ' . $model->getTable());
        });
    }
}
