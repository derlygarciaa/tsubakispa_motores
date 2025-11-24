<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reserva;
use Illuminate\Support\Facades\Validator;

class ReservaController extends Controller
{
    //funcion para mostrar todas las reservas
    public function index() //getReservas
    {
        $reserva = Reserva::with('Usuario')->get();

        if ($reserva->isEmpty()) {
            $data = [
                'message' => 'No se encontraron reservas',
                'status' => 404
            ];
            return response()->json($data, 404); //404 es not found - no se encuentra el recurso solicitado 
        }
        return response()->json($reserva, 200); //200 es OK - todo salio bien, da el recurso
    }

    //funcion para ingresar los datos requeridos para crear una reserva
    public function store(Request $request) //addReserva
    {
        $validator = validator::make($request->all(), [
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_final' => 'required|date_format:H:i',
            'estado' => 'required',
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        $reserva = Reserva::create([
            'usuario_id' => auth()->id(), 
            //auth es una funcion de laravel en autenticacion y se usa para asignar auto. el id
            //en este caso devuelve el id del usuario, es decir, el usuario que esta realizando la accion
            'fecha' => $request->fecha,
            'hora_inicio' => $request->hora_inicio,
            'hora_final' => $request->hora_final,
            'estado' => $request->estado,
        ]);

        if (!$reserva) {
            $data = [
                'message' => 'Error al crear reserva',
                'status' => 500 //500 es internal server error - error inesperado en el servidor
            ];
            return response()->json($data, 500);
        }
         $data = [
            'reserva' => $reserva,
            'status' => 201
         ];
         return response()->json($data, 201); // 201 es created - se creo un nuevo recurso (reserva)   
    }

    //funcion para mostrar una reserva
    public function show($id) //getReservasById
    {
        $reserva = Reserva::find($id);

        if(!$reserva){
            $data = [
                'message' => 'Reserva no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'reserva' => $reserva,
            'status' => 200
        ];
            return response()->json($data, 200);
    }

    //funcion para eliminar una reserva
    public function destroy($id) //deleteReservaById
    {
        $reserva = Reserva::find($id);

        if(!$reserva){
            $data = [
                'message' => 'Reserva no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $reserva->delete();

        $data = [
            'message' => 'Reserva eliminada',
            'status' => 200
        ];
            return response()->json($data, 200);
    }

    //funcion para actualizar una reserva
    public function update(Request $request, $id)   
    {
        $reserva = Reserva::find($id);

        if(!$reserva){
            $data = [
                'message' => 'Reserva no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

           $validator = validator::make($request->all(), [
            'usuario_id' => 'required|integer|exists:usuarios,id',
            'fecha' => 'required|date',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_final' => 'required|date_format:H:i|after:hora_inicio',
            'estado' => 'required',
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        $reserva->usuario_id = $request->usuario_id;
        $reserva->fecha = $request->fecha;
        $reserva->hora_inicio = $request->hora_inicio;
        $reserva->hora_final = $request->hora_final;
        $reserva->estado = $request->estado;

        $reserva->save();

        $data = [
            'message' => 'Reserva actualizada',
            'reserva' => $reserva,
            'status' => 200
        ];
            return response()->json($data, 200);
    }

    //funcion para actualizar un dato en especifico de una reserva
    public function updatePartial(Request $request, $id) //updateReservaById
    {
        $reserva = Reserva::find($id);

        if(!$reserva){
            $data = [
                'message' => 'Reserva no encontrada',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

           $validator = validator::make($request->all(), [
            'usuario_id' => 'sometimes|integer|exists:usuarios,id',
            'fecha' => 'sometimes|date',
            //solo si viene: debe ser una fecha válida (YYYY-MM-DD)
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_final' => 'sometimes|date_format:H:i',
            'estado' => 'sometimes',
            //el sometimes es para decir: el campo no es obligatorio pero si viene debe cumplir esta regla
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        if ($request->has('usuario_id')) {
            $reserva->usuario_id = $request->usuario_id;
        }
        
        if ($request->has('fecha')) {
            $reserva->fecha = $request->fecha;
        }

        if ($request->has('hora_inicio')) {
            $reserva->hora_inicio = $request->hora_inicio;
        }

        if ($request->has('hora_final')) {
            $reserva->hora_final = $request->hora_final;
        }

        if ($request->has('estado')) {
           $reserva->estado = $request->estado;
        }
        
        $reserva->save();

        $data = [
            'message' => 'Reserva actualizada',
            'reserva' => $reserva,
            'status' => 200
        ];
            return response()->json($data, 200);
    }
}