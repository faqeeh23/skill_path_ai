<?php

namespace App\Policies;

use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array(
            $user->role,
            ['student', 'instructor', 'admin'],
            true
        );
    }

    public function view(User $user, Lesson $lesson): bool
    {
        return $user->role === 'admin'
            || (
                $user->role === 'instructor'
                && $user->id === $lesson->instructor_id
            )
            || (
                in_array($user->role, ['student', 'instructor'], true)
                && $lesson->status === 'published'
            );
    }

    public function create(User $user): bool
    {
        return in_array(
            $user->role,
            ['admin', 'instructor'],
            true
        );
    }

    public function update(User $user, Lesson $lesson): bool
    {
        return $user->role === 'admin'
            || (
                $user->role === 'instructor'
                && $user->id === $lesson->instructor_id
            );
    }

    public function delete(User $user, Lesson $lesson): bool
    {
        return $user->role === 'admin';
    }
}