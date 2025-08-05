<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Alerta extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'alertas';

    protected $fillable = [
        'locker_id',
        'mensaje',
        'tipo',
        'fecha',
        'usuario_id'
    ];
}
