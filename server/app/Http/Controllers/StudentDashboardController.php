<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentDashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $student = $request->user();
        abort_unless($student->role === 'student', 403);

        $enrollment = $student->enrollments()->where('status', 'active')->with([
            'path:id,title,description',
            'project:id,enrollment_id,title,status',
        ])->first();

        if (! $enrollment) {
            return response()->json(['path' => null]);
        }

        $items = $enrollment->pathItems()
            ->whereHas('lesson', fn ($query) => $query->where('status', 'published'))
            ->with('lesson:id,title,description,duration_seconds,video_url')
            ->get(['id', 'lesson_id', 'completed_at', 'last_position_seconds']);

        $next = $items->firstWhere('completed_at', null);
        $checkpoints = $enrollment->path->quizzes()->where('status', 'published')
            ->orderBy('id')->get(['id', 'title']);
        $submitted = $enrollment->quizSubmissions()->whereNotNull('submitted_at')
            ->whereIn('quiz_id', $checkpoints->modelKeys())->distinct()->pluck('quiz_id');

        return response()->json([
            'path' => $enrollment->path,
            'lessons' => [
                'total' => $items->count(),
                'completed' => $items->whereNotNull('completed_at')->count(),
            ],
            'next_lesson' => $next ? [
                ...$next->lesson->toArray(),
                'resume_at' => $next->last_position_seconds,
            ] : null,
            'checkpoint' => [
                'total' => $checkpoints->count(),
                'submitted' => $submitted->count(),
                'next' => $checkpoints->whereNotIn('id', $submitted)->first()?->title,
            ],
            'project' => $enrollment->project,
        ]);
    }
}
