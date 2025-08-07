<?php

return [

    'default' => env('FILESYSTEM_DISK', 'local'),

    'disks' => [

        'local' => [
            'driver' => 'local',
            // Fix: Change the root to point to the 'app/public' directory
            'root' => storage_path('app/public'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        // ... (rest of the s3 disk configuration remains the same)
    ],

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];