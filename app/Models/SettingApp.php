<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SettingApp extends Model
{
    protected $table = 'settingapp';

    protected $fillable = [
        'app_name',
        'description',
        'logo',
        'favicon',
        'color',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];  


    public $timestamps = true;

    /**
     * Get the logo URL.
     *
     * @return string
     */
    public function getLogoUrlAttribute()
    {
        return asset('storage/' . $this->logo);
    }

    /**
     * Get the favicon URL.
     *
     * @return string
     */
    public function getFaviconUrlAttribute()
    {
        return asset('storage/' . $this->favicon);
    }
}
