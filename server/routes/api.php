<?php

use App\Http\Controllers\StudentDashboardController;
use App\Services\EmailVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authenticated users
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/email/verification-code', function (
        Request $request,
        EmailVerificationService $verification
    ) {
        $validated = $request->validate([
            'code' => ['required', 'string', 'regex:/\A[0-9]{6}\z/'],
        ]);

        $verification->verify(
            $request->user(),
            $validated['code']
        );

        return response()->noContent();

    })->middleware('throttle:10,1');

});

// Authenticated and verified users
Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    // Student Routes
    Route::prefix('student')
        ->middleware('can:access-student')
        ->group(function () {

            Route::get('/dashboard', StudentDashboardController::class);

        });

    // Instructor Routes
    Route::prefix('instructor')
        ->middleware('can:access-instructor')
        ->group(function () {

            // Future instructor routes

        });

    // Admin Routes
    Route::prefix('admin')
        ->middleware('can:access-admin')
        ->group(function () {

            // Future admin routes

        });

    // Temporary verification test
    Route::get('/test-verified', function () {
        return response()->json([
            'message' => 'Your email is verified.',
        ]);
    });

});