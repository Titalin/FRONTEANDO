<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Locker extends Model
{
    protected $connection = 'mysql'; 
    protected $table = 'lockers';

    protected $fillable = [
        'identificador',
        'ubicacion',
        'estado',
        'tipo',
        'empresa_id',
        'usuario_id',
        'temp_min',
        'temp_max',
        'hum_min',
        'hum_max',
        'peso_max'
    ];
}
