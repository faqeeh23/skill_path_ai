<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'application' => 'SkillPath AI',
        'version' => '1.0.0'
    ]);
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'SkillPath API is running'
    ]);
});

Route::get('/paltform-info', function() {
    return response()->json([
        'name' => 'SkillPath AI',
        'version' => '1.0.0',
        'features' => ['Adaptive Learning', 'AI Recommendations' , 'SkillAssessment']
    ]);
     
});