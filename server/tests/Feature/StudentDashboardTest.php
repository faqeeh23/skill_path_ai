<?php

namespace Tests\Feature;

use App\Models\CareerGoal;
use App\Models\Lesson;
use App\Models\Path;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_requires_a_student_session(): void
    {
        $this->getJson('/api/student/dashboard')->assertUnauthorized();

        $instructor = User::factory()->create(['role' => 'instructor']);
        $this->actingAs($instructor)->getJson('/api/student/dashboard')->assertForbidden();
    }

    public function test_dashboard_reports_only_the_signed_in_students_published_learning_progress(): void
    {
        $student = User::factory()->create();
        $otherStudent = User::factory()->create();
        $instructor = User::factory()->create(['role' => 'instructor']);
        $goal = CareerGoal::create(['name' => 'Web Development', 'slug' => 'web']);
        $path = Path::create(['career_goal_id' => $goal->id, 'title' => 'Web Foundations', 'slug' => 'web-foundations']);
        $enrollment = $student->enrollments()->create(['path_id' => $path->id]);
        $skill = Skill::create(['name' => 'HTML', 'slug' => 'html']);

        foreach (['Draft', 'Completed', 'Next'] as $index => $title) {
            $lesson = Lesson::create([
                'skill_id' => $skill->id,
                'instructor_id' => $instructor->id,
                'title' => $title,
                'processing_status' => 'ready',
                'status' => $title === 'Draft' ? 'draft' : 'published',
            ]);
            $enrollment->pathItems()->create([
                'lesson_id' => $lesson->id,
                'sequence' => $index + 1,
                'completed_at' => $title === 'Completed' ? now() : null,
                'last_position_seconds' => 30,
            ]);
        }

        $checkpoint = $path->quizzes()->create(['title' => 'HTML checkpoint', 'status' => 'published']);
        $path->quizzes()->create(['title' => 'Next checkpoint', 'status' => 'published']);
        $enrollment->quizSubmissions()->create(['quiz_id' => $checkpoint->id, 'submitted_at' => now()]);
        $enrollment->project()->create(['title' => 'Portfolio', 'description' => 'Build a portfolio.', 'status' => 'approved']);

        $this->actingAs($student)->getJson('/api/student/dashboard')->assertOk()
            ->assertJsonPath('path.title', 'Web Foundations')
            ->assertJsonPath('lessons.total', 2)
            ->assertJsonPath('lessons.completed', 1)
            ->assertJsonPath('next_lesson.title', 'Next')
            ->assertJsonPath('next_lesson.resume_at', 30)
            ->assertJsonPath('checkpoint.submitted', 1)
            ->assertJsonPath('checkpoint.next', 'Next checkpoint')
            ->assertJsonPath('project.status', 'approved');

        $this->actingAs($otherStudent)->getJson('/api/student/dashboard')->assertOk()
            ->assertExactJson(['path' => null]);
    }
}
