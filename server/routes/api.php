<?php

use App\Http\Controllers\Admin\CareerGoalController;
use App\Http\Controllers\Admin\IconController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\EmailChangeController;
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

Route::middleware(['auth:sanctum', 'auth:web', 'verified', 'password.confirm'])
    ->prefix('email/change')
    ->group(function () {
        Route::post('/request', [EmailChangeController::class, 'send'])
            ->middleware('throttle:5,1,email-change-request');
        Route::post('/verify', [EmailChangeController::class, 'verify'])
            ->middleware('throttle:10,1,email-change-verify');
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
            Route::apiResource('users', UserController::class)->only(['index', 'show', 'update']);

            Route::apiResource('career-goals', CareerGoalController::class)->only(['index', 'store']);
            Route::put('/career-goals/{careerGoal}', [CareerGoalController::class, 'update']);
            Route::get('/icons', [IconController::class, 'index']);
        });

    // Temporary verification test
    Route::get('/test-verified', function () {
        return response()->json([
            'message' => 'Your email is verified.',
        ]);
    });



});
