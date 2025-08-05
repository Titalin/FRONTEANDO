<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CodigoAperturaController extends Controller
{
    // Genera un nuevo código temporal
    public function generar(Request $request)
    {
        $request->validate([
            'locker_id' => 'required|integer'
        ]);

        $timestamp = now()->timestamp * 1000; // milisegundos
        $codigo = "BODEGIX-LOCKER-{$request->locker_id}-{$timestamp}";

        DB::connection('mongodb')->collection('codigos_temporales')->insert([
            'locker_id' => $request->locker_id,
            'codigo' => $codigo,
            'creado_en' => now(),
        ]);

        return response()->json(['codigo' => $codigo]);
    }

    // Verifica si hay código válido para ese locker
    public function validar($locker_id)
    {
        $codigo = DB::connection('mongodb')
            ->collection('codigos_temporales')
            ->where('locker_id', intval($locker_id))
            ->orderBy('creado_en', 'desc')
            ->first();

        if (!$codigo) {
            return response()->json(['abrir' => false]);
        }

        $creado = Carbon::parse($codigo['creado_en']);
        if ($creado->diffInSeconds(now()) <= 15) {
            DB::connection('mongodb')->collection('codigos_temporales')->deleteOne(['_id' => $codigo['_id']]);
            return response()->json(['abrir' => true]);
        }

        return response()->json(['abrir' => false]);
    }
}
