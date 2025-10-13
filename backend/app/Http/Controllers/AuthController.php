<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash; //sirve para encriptar la contraseña
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = validator::make($request->all(), [
            'rol_id' => 'required',
            'nombres' => 'required',
            'apellidos' => 'required',
            'telefono' => 'required|digits:10',
            'email' => 'required|email|unique:usuarios',
            'password' => 'required|confirmed'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        $Usuarios = Usuario::create([
            'rol_id' => $request->rol_id,
            'nombres' => $request->nombres,
            'apellidos' => $request->apellidos,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if (!$Usuarios) {
            $data = [
                'message' => 'Error al crear el usuario',
                'status' => 500 //500 es internal server error - error inesperado en el servidor
            ];
            return response()->json($data, 500);
        }
         $data = [
            'usuario' => $Usuarios,
            'status' => 201
         ];
         return response()->json($data, 201); // 201 es created - se creo un nuevo recurso (usuario)   
    }

    public function login(Request $request)
    {
        $validator = validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            $data = [
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        $credenciales = $request->only(['email', 'password']);

        try {
            if (!$token = JWTAuth::attempt($credenciales)) {
                return response()->json(['error' => 'Credenciales invalidas'], 401); //401 es usuario no esta autenticado, token invalido
            }
            return response()->json(['token' => $token], 200);

        } catch (JWTException $e) {
                return response()->json(['error' => 'No se pudo generar el token', $e], 500);
        }
    }

    public function getUser()
    {
        $usuario = Auth::user();
        return response()->json($usuario, 200);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Sección cerrada, exitosamente'], 200);
    }
}
