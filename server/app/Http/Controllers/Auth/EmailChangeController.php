<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\EmailChangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailChangeController extends Controller
{
    public function __construct(private EmailChangeService $emailChangeService) {}

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $this->emailChangeService->send($request->user(), $validated['email']);

        return response()->json(['message' => 'Verification code sent to your new email.']);
    }

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'regex:/\A[0-9]{6}\z/'],
        ]);

        $this->emailChangeService->verify($request->user(), $validated['code']);

        return response()->json(['message' => 'Your email has been updated successfully.']);
    }
}
