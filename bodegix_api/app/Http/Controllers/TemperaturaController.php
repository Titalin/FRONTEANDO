<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Temperatura;

class TemperaturaController extends Controller
{
    // Método para recibir datos desde el IoT
    public function store(Request $request)
    {
        $request->validate([
            'locker_id' => 'required|string',
            'temperatura' => 'required|numeric',
            'humedad' => 'required|numeric',
            'peso' => 'nullable|numeric', // ✅ Nuevo campo opcional
        ]);

        $registro = Temperatura::create([
            'locker_id' => $request->locker_id,
            'temperatura' => $request->temperatura,
            'humedad' => $request->humedad,
            'peso' => $request->peso ?? null, // ✅ Guardar peso si viene
            'timestamp' => now()
        ]);

        return response()->json([
            'message' => 'Datos guardados correctamente',
            'data' => $registro
        ], 201);
    }

    // Método para consultar por locker
    public function porLocker($locker_id)
    {
        $registros = Temperatura::where('locker_id', $locker_id)
            ->orderBy('timestamp', 'desc')
            ->take(20)
            ->get();

        return response()->json($registros);
    }
}
