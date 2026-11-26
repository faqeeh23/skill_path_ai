<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    private array $userFields = ['id', 'name', 'email', 'role', 'is_active', 'email_verified_at', 'created_at', 'updated_at'];

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'in:admin,student,instructor'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $query = User::query()->select($this->userFields);
        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('is_active')) {
            $query->where(
                'is_active',
                $request->boolean('is_active')
            );
        }

        $users = $query->latest()->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();
        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->only($this->userFields));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'role' => ['sometimes', 'required', 'in:admin,student,instructor'],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ]);

        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $actorId = $actor->getKey();
        $targetId = $user->getKey();
        [$updatedUser, $changes] = $user->getConnection()->transaction(function () use ($user, $actorId, $targetId, $validated) {
            $accounts = $user->newQuery()
                ->whereKey([$actorId, $targetId])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $admin = $accounts->get($actorId);
            abort_unless($admin instanceof User && $admin->isActive() && $admin->role === 'admin', 403);

            $target = $accounts->get($targetId);
            abort_unless($target instanceof User, 404);
            $target->forceFill($validated);

            if ($actorId === $targetId && $target->isDirty(['role', 'is_active'])) {
                throw ValidationException::withMessages([
                    'account' => ['You cannot change your own role or account status.'],
                ]);
            }

            $changes = array_keys($target->getDirty());
            $target->save();

            return [$target, $changes];
        });

        if ($changes) {
            Log::info('Admin updated a user account.', [
                'admin_id' => $actorId,
                'user_id' => $targetId,
                'fields' => $changes,
            ]);
        }

        return response()->json($updatedUser->only($this->userFields));
    }
}
