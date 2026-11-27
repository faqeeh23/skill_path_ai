<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareerGoal;
use Illuminate\Http\Request;
use App\Services\CloudinaryService;
use Illuminate\Support\Str;

class CareerGoalController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinary
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(CareerGoal::query()->orderBy('name')->orderBy('id')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'image', 'mimes:png,webp,jpg,jpeg', 'max:1024'],
        ]);
        $slug = Str::slug($validated['name']);

        validator(['slug' => $slug], [
            'slug' => ['required', 'max:100', 'unique:career_goals,slug'],

        ])->validate();

        $data =[
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'icon_url' => null,
        ];

        $image = null;

        try {
            if ($request->hasFile('icon')) {
                $image = $this->cloudinary->uploadImage(
                    $request->file('icon'),
                    'skillpath/career-goals'
                );
                $data['icon_url'] =$image['url'];
                $data['icon_public_id'] = $image['public_id'];
            }

            $careerGoal = CareerGoal::create($data);
        } catch (\Throwable $e) {
            if($image !== null) {
                try {
                    $this->cloudinary->deleteImage(
                        $image['public_id']
                    );
                }catch (\Throwable $cleanupError) {
                    report($cleanupError);
                }
            }
            throw $e;
        }
        return response()->json($careerGoal , 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
