<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Servicio;

class ServicioController extends Controller
{
    //define el metodo para obtener todos los servicios activos
    public function index()
    {
        try {
            $servicios = Servicio::activo()
                ->orderBy('categoria')
                ->orderBy('nombre')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $servicios,
                'message' => 'Servicios obtenidos exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los servicios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //define el metodo para obtener servicios por categoria
    public function porCategoria($categoria)
    {
        try {
            $servicios = Servicio::activo()
                ->categoria($categoria)
                ->orderBy('nombre')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $servicios,
                'message' => 'Servicios obtenidos exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los servicios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //define el metodo para obtener un servicio especifico
    public function show($id)
    {
        try {
            $servicio = Servicio::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $servicio,
                'message' => 'Servicio obtenido exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Servicio no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}

