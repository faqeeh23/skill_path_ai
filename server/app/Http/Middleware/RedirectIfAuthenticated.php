<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated as LaravelRedirectIfAuthenticated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated extends LaravelRedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        if ($request->routeIs('login.store') && $request->expectsJson()) {
            foreach ($guards ?: [null] as $guard) {
                if (Auth::guard($guard)->check()) {
                    return response()->json(['message' => 'You are already signed in.'], 409);
                }
            }

            return $next($request);
        }

        return parent::handle($request, $next, ...$guards);
    }
}
