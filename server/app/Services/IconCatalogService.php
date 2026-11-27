<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class IconCatalogService
{
    private const BASE_URL = 'https://cdn.jsdelivr.net/npm/devicon@2.18.0/icons';

    public function all(): Collection
    {
        $catalog = json_decode(file_get_contents(resource_path('data/devicon.json')), true, 512, JSON_THROW_ON_ERROR);

        return collect($catalog)
            ->flatMap(function (array $technology) {
                $name = $technology['name'];

                return collect($technology['versions']['svg'] ?? [])->map(function (string $variant) use ($name) {
                    $key = "{$name}/{$name}-{$variant}.svg";

                    return [
                        'key' => $key,
                        'name' => $name,
                        'variant' => $variant,
                        'url' => self::BASE_URL.'/'.$key,
                    ];
                });
            })
            ->sortBy('name')
            ->values();
    }

    public function resolve(string $key): array
    {
        $icon = $this->all()->firstWhere('key', $key);

        if ($icon === null) {
            throw ValidationException::withMessages([
                'icon_key' => ['Invalid technology icon.'],
            ]);
        }

        return ['icon_url' => $icon['url'], 'icon_public_id' => null];
    }
}
