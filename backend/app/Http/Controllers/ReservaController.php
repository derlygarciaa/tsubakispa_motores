<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reserva;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ReservaController extends Controller
{
    //funcion para mostrar todas las reservas
    public function index()
    {
        try {
            $reservas = Reserva::with([
                    'usuario:id,nombres,apellidos,email,telefono',
                    'servicio:id,nombre,descripcion,duracion_minutos,precio,categoria'
                ])
                ->orderBy('fecha', 'desc')
                ->orderBy('hora_inicio', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reservas,
                'message' => 'Reservas obtenidas exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las reservas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //funcion para mostrar las reservas del usuario autenticado
    public function misReservas()
    {
        try {
            $usuario = auth()->user();
            
            $reservas = Reserva::where('usuario_id', $usuario->id)
                ->with([
                    'usuario:id,nombres,apellidos,email,telefono',
                    'servicio:id,nombre,descripcion,duracion_minutos,precio,categoria'
                ])
                ->orderBy('fecha', 'desc')
                ->orderBy('hora_inicio', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reservas,
                'message' => 'Tus reservas obtenidas exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tus reservas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //funcion para crear una reserva
    public function store(Request $request)
    {
        try {
            $usuarioAutenticado = auth()->user();
            $esAdmin = $usuarioAutenticado->rol_id === 1;

            // Si no es admin, forzar que la reserva sea para el usuario autenticado
            if (!$esAdmin) {
                $request->merge(['usuario_id' => $usuarioAutenticado->id]);
                // Forzar estado pendiente para usuarios normales
                $request->merge(['estado' => Reserva::ESTADO_PENDIENTE]);
            }

            //validacion inicial de datos
            $validator = Validator::make($request->all(), [
                'usuario_id' => 'required|integer|exists:usuarios,id',
                'servicio_id' => 'required|integer|exists:servicios,id',
                'fecha' => 'required|date|after_or_equal:today',
                'hora_inicio' => 'required|date_format:H:i',
                'hora_final' => 'required|date_format:H:i|after:hora_inicio',
                'telefono_contacto' => 'nullable|string|max:15',
                'numero_personas' => 'nullable|integer|min:1|max:10',
                'observaciones' => 'nullable|string|max:500',
                'precio' => 'nullable|numeric|min:0',
                'estado' => 'nullable|in:pendiente,confirmada,cancelada',
            ], [
                'fecha.after_or_equal' => 'La fecha no puede ser en el pasado',
                'hora_final.after' => 'La hora final debe ser posterior a la hora de inicio',
                'usuario_id.exists' => 'El usuario seleccionado no existe',
                'servicio_id.required' => 'Debe seleccionar un servicio',
                'servicio_id.exists' => 'El servicio seleccionado no existe',
                'numero_personas.min' => 'Debe haber al menos 1 persona',
                'numero_personas.max' => 'El máximo es de 10 personas',
                'observaciones.max' => 'Las observaciones no pueden exceder 500 caracteres',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error en la validación de los datos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validación de horario de negocio (9:00 AM - 8:00 PM)
            $horaInicio = Carbon::createFromFormat('H:i', $request->hora_inicio);
            $horaFinal = Carbon::createFromFormat('H:i', $request->hora_final);
            $apertura = Carbon::createFromFormat('H:i', '09:00');
            $cierre = Carbon::createFromFormat('H:i', '20:00');

            if ($horaInicio->lt($apertura) || $horaFinal->gt($cierre)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El horario debe estar entre 9:00 AM y 8:00 PM'
                ], 422);
            }

            // Validación de duración (mínimo 30 minutos, máximo 3 horas)
            $duracionMinutos = $horaInicio->diffInMinutes($horaFinal);
            if ($duracionMinutos < 30) {
                return response()->json([
                    'success' => false,
                    'message' => 'La reserva debe tener una duración mínima de 30 minutos'
                ], 422);
            }
            if ($duracionMinutos > 180) {
                return response()->json([
                    'success' => false,
                    'message' => 'La reserva no puede exceder las 3 horas'
                ], 422);
            }

            // Validación de conflictos de horario
            $conflicto = Reserva::where('fecha', $request->fecha)
                ->where('estado', '!=', Reserva::ESTADO_CANCELADA)
                ->where(function ($query) use ($request) {
                    $query->whereBetween('hora_inicio', [$request->hora_inicio, $request->hora_final])
                        ->orWhereBetween('hora_final', [$request->hora_inicio, $request->hora_final])
                        ->orWhere(function ($q) use ($request) {
                            $q->where('hora_inicio', '<=', $request->hora_inicio)
                              ->where('hora_final', '>=', $request->hora_final);
                        });
                })
                ->exists();

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una reserva en ese horario. Por favor, seleccione otro horario.'
                ], 409); //409 Conflict - ya existe una reserva en ese horario
            }

            // Crear la reserva
            DB::beginTransaction();

            $reserva = Reserva::create([
                'usuario_id' => $request->usuario_id,
                'servicio_id' => $request->servicio_id,
                'fecha' => $request->fecha,
                'hora_inicio' => $request->hora_inicio,
                'hora_final' => $request->hora_final,
                'telefono_contacto' => $request->telefono_contacto,
                'numero_personas' => $request->numero_personas ?? 1,
                'observaciones' => $request->observaciones,
                'precio' => $request->precio,
                'estado' => $request->estado ?? Reserva::ESTADO_PENDIENTE,
            ]);

            $reserva->load(['usuario:id,nombres,apellidos,email,telefono', 'servicio:id,nombre,precio,duracion_minutos']);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $reserva,
                'message' => 'Reserva creada exitosamente'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //funcion para mostrar una reserva
    public function show($id)
    {
        try {
            $reserva = Reserva::with('usuario:id,nombres,apellidos,email,telefono')->find($id);

            if (!$reserva) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reserva no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $reserva,
                'message' => 'Reserva obtenida exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //funcion para eliminar una reserva
    public function destroy($id)
    {
        try {
            $reserva = Reserva::find($id);

            if (!$reserva) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reserva no encontrada'
                ], 404);
            }

            DB::beginTransaction();
            $reserva->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reserva eliminada exitosamente'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //funcion para actualizar una reserva
    public function update(Request $request, $id)
    {
        try {
            $reserva = Reserva::find($id);

            if (!$reserva) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reserva no encontrada'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'usuario_id' => 'required|integer|exists:usuarios,id',
                'servicio_id' => 'required|integer|exists:servicios,id',
                'fecha' => 'required|date|after_or_equal:today',
                'hora_inicio' => 'required|date_format:H:i',
                'hora_final' => 'required|date_format:H:i|after:hora_inicio',
                'telefono_contacto' => 'nullable|string|max:15',
                'numero_personas' => 'nullable|integer|min:1|max:10',
                'observaciones' => 'nullable|string|max:500',
                'precio' => 'nullable|numeric|min:0',
                'estado' => 'required|in:pendiente,confirmada,cancelada',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error en la validación de los datos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validar horario de operación (9:00 AM a 8:00 PM)
            $horaInicio = \Carbon\Carbon::createFromFormat('H:i', $request->hora_inicio);
            $horaFinal = \Carbon\Carbon::createFromFormat('H:i', $request->hora_final);
            $apertura = \Carbon\Carbon::createFromFormat('H:i', '09:00');
            $cierre = \Carbon\Carbon::createFromFormat('H:i', '20:00');

            if ($horaInicio->lt($apertura) || $horaFinal->gt($cierre)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El horario debe estar entre 9:00 AM y 8:00 PM'
                ], 422);
            }

            // Validar conflictos de horario (excluyendo la reserva actual)
            $conflicto = Reserva::where('id', '!=', $id)
                ->where('fecha', $request->fecha)
                ->where('estado', '!=', Reserva::ESTADO_CANCELADA)
                ->where(function ($query) use ($request) {
                    $query->whereBetween('hora_inicio', [$request->hora_inicio, $request->hora_final])
                        ->orWhereBetween('hora_final', [$request->hora_inicio, $request->hora_final])
                        ->orWhere(function ($q) use ($request) {
                            $q->where('hora_inicio', '<=', $request->hora_inicio)
                              ->where('hora_final', '>=', $request->hora_final);
                        });
                })
                ->exists();

            if ($conflicto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una reserva en ese horario. Por favor, seleccione otro horario.'
                ], 409);
            }

            DB::beginTransaction();

            $reserva->update([
                'usuario_id' => $request->usuario_id,
                'servicio_id' => $request->servicio_id,
                'fecha' => $request->fecha,
                'hora_inicio' => $request->hora_inicio,
                'hora_final' => $request->hora_final,
                'telefono_contacto' => $request->telefono_contacto,
                'numero_personas' => $request->numero_personas ?? 1,
                'observaciones' => $request->observaciones,
                'precio' => $request->precio,
                'estado' => $request->estado,
            ]);

            $reserva->load([
                'usuario:id,nombres,apellidos,email,telefono',
                'servicio:id,nombre,descripcion,duracion_minutos,precio,categoria'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $reserva,
                'message' => 'Reserva actualizada exitosamente'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    //funcion para actualizar una reserva parcialmente
    public function updatePartial(Request $request, $id)
    {
        try {
            $reserva = Reserva::find($id);

            if (!$reserva) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reserva no encontrada'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'usuario_id' => 'sometimes|integer|exists:usuarios,id',
                'fecha' => 'sometimes|date',
                'hora_inicio' => 'sometimes|date_format:H:i',
                'hora_final' => 'sometimes|date_format:H:i',
                'estado' => 'sometimes|in:pendiente,confirmada,cancelada',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error en la validación de los datos',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $dataToUpdate = $request->only([
                'usuario_id', 
                'fecha', 
                'hora_inicio', 
                'hora_final', 
                'estado'
            ]);

            $reserva->update(array_filter($dataToUpdate));
            $reserva->load('usuario:id,nombres,apellidos,email');

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $reserva,
                'message' => 'Reserva actualizada exitosamente'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la reserva',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}