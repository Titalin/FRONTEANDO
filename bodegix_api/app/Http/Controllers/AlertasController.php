<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Temperatura; // Modelo Mongo
use App\Models\Locker; // Modelo MySQL

class AlertasController extends Controller
{
    public function getByUsuario($usuario_id)
    {
        $alertas = [];

        // 1️⃣ Buscar lockers asignados al usuario (MySQL)
        $lockers = Locker::where('usuario_id', $usuario_id)->get();

        foreach ($lockers as $locker) {
            // 2️⃣ Consultar último registro de sensores en Mongo
            $ultimoRegistro = Temperatura::where('locker_id', 'LOCKER_' . str_pad($locker->identificador, 3, '0', STR_PAD_LEFT))
                ->orderBy('timestamp', 'desc')
                ->first();

            if ($ultimoRegistro) {
                // 3️⃣ Comparar temperatura
                if ($locker->temp_min !== null && $ultimoRegistro->temperatura < $locker->temp_min) {
                    $alertas[] = [
                        'tipo' => 'temperatura',
                        'mensaje' => "Locker {$locker->identificador}: Temperatura por debajo del mínimo ({$ultimoRegistro->temperatura}°C)"
                    ];
                }
                if ($locker->temp_max !== null && $ultimoRegistro->temperatura > $locker->temp_max) {
                    $alertas[] = [
                        'tipo' => 'temperatura',
                        'mensaje' => "Locker {$locker->identificador}: Temperatura por encima del máximo ({$ultimoRegistro->temperatura}°C)"
                    ];
                }

                // 4️⃣ Comparar humedad
                if ($locker->hum_min !== null && $ultimoRegistro->humedad < $locker->hum_min) {
                    $alertas[] = [
                        'tipo' => 'humedad',
                        'mensaje' => "Locker {$locker->identificador}: Humedad por debajo del mínimo ({$ultimoRegistro->humedad}%)"
                    ];
                }
                if ($locker->hum_max !== null && $ultimoRegistro->humedad > $locker->hum_max) {
                    $alertas[] = [
                        'tipo' => 'humedad',
                        'mensaje' => "Locker {$locker->identificador}: Humedad por encima del máximo ({$ultimoRegistro->humedad}%)"
                    ];
                }

                // 5️⃣ Comparar peso (si tu Mongo guarda un campo peso)
                if ($locker->peso_max !== null && isset($ultimoRegistro->peso) && $ultimoRegistro->peso > $locker->peso_max) {
                    $alertas[] = [
                        'tipo' => 'peso',
                        'mensaje' => "Locker {$locker->identificador}: Peso excedido ({$ultimoRegistro->peso} kg)"
                    ];
                }
            }

            // 6️⃣ Estado inactivo
            if ($locker->estado === 'inactivo') {
                $alertas[] = [
                    'tipo' => 'estado',
                    'mensaje' => "Locker {$locker->identificador} está inactivo"
                ];
            }
        }

        return response()->json($alertas);
    }
}
