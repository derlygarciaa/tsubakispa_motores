<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash; //sirve para encriptar la contraseña
use Illuminate\Support\Facades\Validator;

class UsuarioController extends Controller
{
    //funcion para mostrar todos los usuarios
    public function index()
    {
        $Usuarios = Usuario::all();

        if ($Usuarios->isEmpty()) {
            $data = [
                'success' => false,
                'message' => 'No se encontraron usuarios',
                'status' => 404
            ];
            return response()->json($data, 404); //404 es not found - no se encuentra el recurso solicitado 
        }
        
        $data = [
            'success' => true,
            'data' => $Usuarios,
            'status' => 200
        ];
        return response()->json($data, 200); 
    }

    //funcion para ingresar los datos requeridos para crear un usuario
    public function store(Request $request)
    {
        $validator = validator::make($request->all(), [
            'nombres' => 'required',
            'apellidos' => 'required',
            'telefono' => 'required|digits:10',
            'email' => 'required|email|unique:usuario',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            $data = [
                'success' => false,
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        $Usuarios = Usuario::create([
            'rol_id' => 2, //queda por defecto como usuario
            'nombres' => $request->nombres,
            'apellidos' => $request->apellidos,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if (!$Usuarios) {
            $data = [
                'success' => false,
                'message' => 'Error al crear el usuario',
                'status' => 500 //500 es internal server error - error inesperado en el servidor
            ];
            return response()->json($data, 500);
        }
         $data = [
            'success' => true,
            'data' => $Usuarios,
            'message' => 'Usuario creado exitosamente',
            'status' => 201
         ];
         return response()->json($data, 201); // 201 es created - se creo un nuevo recurso (usuario)   
    }

    //funcion para mostrar un usuario
    public function show($id) //id es un parametro
    {
        $usuario = Usuario::find($id);

        if(!$usuario){
            $data = [
                'success' => false,
                'message' => 'Usuario no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $data = [
            'success' => true,
            'data' => $usuario,
            'status' => 200
        ];
            return response()->json($data, 200);
    }

    //funcion para eliminar un usuario
    public function destroy($id)
    {
        $usuario = Usuario::find($id);

        if(!$usuario){
            $data = [
                'success' => false,
                'message' => 'Usuario no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

        $usuario->delete();

        $data = [
            'success' => true,
            'message' => 'Usuario eliminado',
            'status' => 200
        ];
            return response()->json($data, 200);
    }

    //funcion para actualizar un usuario
    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if(!$usuario){
            $data = [
                'success' => false,
                'message' => 'Usuario no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

           $validator = validator::make($request->all(), [
            'rol_id' => 'required',
            'nombres' => 'required',
            'apellidos' => 'required',
            'telefono' => 'required|digits:10',
            'email' => 'required|email|unique:usuarios,email,' . $id,
            // para que no bloquee ese mismo correo al actualizar
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            $data = [
                'success' => false,
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        $usuario->rol_id = $request->rol_id;
        $usuario->nombres = $request->nombres;
        $usuario->apellidos = $request->apellidos;
        $usuario->telefono = $request->telefono;
        $usuario->email = $request->email;
        $usuario->password = Hash::make($request->password);

        $usuario->save();

        $data = [
            'success' => true,
            'data' => $usuario,
            'message' => 'Usuario actualizado',
            'status' => 200
        ];
            return response()->json($data, 200);
    }

    //funcion para actualizar un dato en especifico de un usuario
    public function updatePartial(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if(!$usuario){
            $data = [
                'success' => false,
                'message' => 'Usuario no encontrado',
                'status' => 404
            ];
            return response()->json($data, 404);
        }

           $validator = validator::make($request->all(), [
            'rol_id' => 'max:255',
            'nombres' => 'max:255',
            'apellidos' => 'max:255',
            'telefono' => 'digits:10',
            'email' => 'email|unique:usuarios,email,' . $id,
            // para que no bloquee ese mismo correo al actualizar
            'password' => 'max:255'
        ]);

        if ($validator->fails()) {
            $data = [
                'success' => false,
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        if ($request->has('rol_id')) {
            $usuario->rol_id = $request->rol_id;
        }
        
        if ($request->has('nombres')) {
            $usuario->nombres = $request->nombres;
        }

        if ($request->has('apellidos')) {
            $usuario->apellidos = $request->apellidos;
        }

        if ($request->has('telefono')) {
            $usuario->telefono = $request->telefono;
        }

        if ($request->has('email')) {
           $usuario->email = $request->email;
        }

        if ($request->has('password')) {
            $usuario->password = Hash::make($request->password);
        }
        
        $usuario->save();

        $data = [
            'success' => true,
            'data' => $usuario,
            'message' => 'Usuario actualizado',
            'status' => 200
        ];
            return response()->json($data, 200);
    }
}