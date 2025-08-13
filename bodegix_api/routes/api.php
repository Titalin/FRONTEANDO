<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlertasController;

Route::get('/alertas/usuario/{id}', [AlertasController::class, 'getByUsuario']);
