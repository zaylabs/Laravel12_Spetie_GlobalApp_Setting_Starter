<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

/**
 * We are referencing the Spatie Permission model directly.
 * You can create this file and extend it if you need to add custom logic
 * or methods specific to your application, but it's not strictly necessary.
 */
class Permission extends SpatiePermission
{
    // If you need to add any custom casts, relationships, or methods,
    // you would add them here.
}
