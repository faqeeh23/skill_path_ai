<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use RuntimeException;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary(config('services.cloudinary.url'));
    }

    /** @return array{url: string, public_id: string} */
    public function uploadImage(UploadedFile $file, string $folder): array
    {
        $path = $file->getRealPath();

        if ($path === false || ! is_readable($path)) {
            throw new RuntimeException('Unable to read the uploaded image.');
        }

        $result = $this->cloudinary->uploadApi()->upload($path, [
            'folder' => $folder,
            'resource_type' => 'image',
        ]);

        return [
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    public function deleteImage(string $publicId): void
    {
        $result = $this->cloudinary->uploadApi()->destroy($publicId, [
            'resource_type' => 'image',
            'invalidate' => true,
        ]);

        if (! in_array($result['result'] ?? null, ['ok', 'not found'], true)) {
            throw new RuntimeException('Unable to delete image.');
        }
    }
}
