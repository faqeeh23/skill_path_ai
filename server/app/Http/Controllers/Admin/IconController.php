<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\IconCatalogService;
use Illuminate\Http\JsonResponse;

class IconController extends Controller
{
    public function index(IconCatalogService $catalog): JsonResponse
    {
        return response()->json($catalog->all());
    }
}
