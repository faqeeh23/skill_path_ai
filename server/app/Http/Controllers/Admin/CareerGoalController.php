<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CareerGoal;
use App\Services\IconService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

class CareerGoalController extends Controller
{
    public function __construct(
        private IconService $icons
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(CareerGoal::withCount('paths')->orderBy('name')->orderBy('id')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $this->validatedData($request);
        $iconData = $this->icons->resolve($request, 'skillpath/career-goals');

        try {
            $careerGoal = CareerGoal::create($data + $iconData + ['icon_url' => null]);
        } catch (Throwable $error) {
            $this->handleSaveFailure($error, $iconData);
        }

        return response()->json($careerGoal->loadCount('paths'), 201);
    }

    private function validatedData(Request $request, ?CareerGoal $goal = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);
        $slug = Str::slug($validated['name']);

        $unique = Rule::unique('career_goals', 'slug');
        if ($goal !== null) {
            $unique->ignore($goal);
        }
        validator(['slug' => $slug], ['slug' => ['required', 'max:100', $unique]])->validate();

        return [
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ];
    }

    private function handleSaveFailure(Throwable $error, array $iconData): never
    {
        $this->icons->cleanup($iconData['icon_public_id'] ?? null);

        if ($error instanceof UniqueConstraintViolationException) {
            throw ValidationException::withMessages([
                'slug' => ['This career goal already exists.'],
            ]);
        }

        throw $error;
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
    public function update(Request $request, CareerGoal $careerGoal)
    {
        $data = $this->validatedData($request, $careerGoal);
        $iconData = $this->icons->resolve($request, 'skillpath/career-goals');

        try {
            [$updated, $oldPublicId] = $careerGoal->getConnection()->transaction(function () use ($careerGoal, $data, $iconData) {
                $goal = $careerGoal->newQuery()->lockForUpdate()->findOrFail($careerGoal->getKey());
                $oldPublicId = $goal->icon_public_id;
                $goal->fill($data + $iconData)->saveOrFail();

                return [$goal, $oldPublicId];
            });
        } catch (Throwable $error) {
            $this->handleSaveFailure($error, $iconData);
        }

        if (array_key_exists('icon_public_id', $iconData) && $oldPublicId !== $updated->icon_public_id) {
            $this->icons->cleanup($oldPublicId);
        }

        return response()->json($updated->loadCount('paths'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CareerGoal $careerGoal)
    {
        if ($careerGoal->paths()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a career goal associated with learning paths.',
            ], 409);
        }

        $publicId = $careerGoal->icon_public_id;
        $careerGoal->delete();
        $this->icons->cleanup($publicId);

        return response()->json([
            'message' => 'Career goal deleted successfully.',
        ]);
    }
}
