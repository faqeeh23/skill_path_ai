<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RejectInactiveSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasSession()) {
            return $next($request);
        }

        $guard = Auth::guard('web');
        $user = $guard->user();

        if (! $user instanceof User || $user->isActive()) {
            return $next($request);
        }

        $guard->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Your account is inactive.'], 401);
        }

        return redirect()->away(rtrim(config('app.frontend_url'), '/').'/login');
    }
}
