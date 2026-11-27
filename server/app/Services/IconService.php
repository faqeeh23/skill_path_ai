<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class IconService
{
    public function __construct(
        private CloudinaryService $cloudinary,
        private IconCatalogService $catalog,
    ) {}

    public function resolve(Request $request, string $folder): array
    {
        $validated = $request->validate([
            'icon_mode' => ['required', Rule::in(['keep', 'library', 'upload', 'remove'])],
            'icon_key' => ['required_if:icon_mode,library', 'prohibited_unless:icon_mode,library', 'nullable', 'string', 'max:255'],
            'icon' => ['required_if:icon_mode,upload', 'prohibited_unless:icon_mode,upload', 'nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:1024'],
        ]);

        return match ($validated['icon_mode']) {
            'keep' => [],
            'library' => $this->catalog->resolve($validated['icon_key']),
            'upload' => $this->upload($request, $folder),
            'remove' => ['icon_url' => null, 'icon_public_id' => null],
        };
    }

    private function upload(Request $request, string $folder): array
    {
        $image = $this->cloudinary->uploadImage($request->file('icon'), $folder);

        return ['icon_url' => $image['url'], 'icon_public_id' => $image['public_id']];
    }

    public function cleanup(?string $publicId): void
    {
        if ($publicId === null || $publicId === '') {
            return;
        }

        try {
            $this->cloudinary->deleteImage($publicId);
        } catch (Throwable $error) {
            report($error);
        }
    }
}
