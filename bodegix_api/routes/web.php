<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TemperaturaController;

Route::post('/temperatura', [TemperaturaController::class, 'store']);
Route::get('/temperatura/{locker_id}', [TemperaturaController::class, 'porLocker']);
