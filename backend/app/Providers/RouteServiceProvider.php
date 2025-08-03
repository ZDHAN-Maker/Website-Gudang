<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        $this->routes(function () {
            // ✅ Tambahkan ini untuk memuat route API
            Route::prefix('api')
                ->middleware('api')
                ->group(base_path('routes/api.php'));

            // Tetap jalankan route web
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
