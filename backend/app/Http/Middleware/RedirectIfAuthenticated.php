<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated as Middleware;

class RedirectIfAuthenticated extends Middleware
{
    /**
     * Where to redirect users after login.
     */
    public const HOME = RouteServiceProvider::HOME;
}
