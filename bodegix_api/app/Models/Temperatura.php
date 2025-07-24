<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Temperatura extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'temperaturas';

    protected $fillable = [
        'locker_id',
        'temperatura',
        'humedad',
        'timestamp'
    ];
}
