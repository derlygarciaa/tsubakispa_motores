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
    //para registar un nuevo usuario
    public function register(Request $request)
    {
        //estos son los datos obligatorios requeridos que seran verificados para crear un usuario nuevo
        $validator = validator::make($request->all(), [
            'nombres' => 'required',
            'apellidos' => 'required',
            'telefono' => 'required|digits:10',
            'email' => 'required|email|unique:usuarios',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            $data = [
                'isSuccess' => false,
                'message' => 'Error en la validacion de los datos',
                'errors' => $validator->errors(),
                'status' => 400 //400 es bad request - peticion mal formada o incompleta
            ];
            return response()->json($data, 400);
        }

        //si todos los datos que estan requeridos estan bien se crea el usuario
        $Usuarios = Usuario::create([
            'rol_id' => 2, //queda por defecto como usuario
            'nombres' => $request->nombres,
            'apellidos' => $request->apellidos,
            'telefono' => $request->telefono,
            'email' => $request->email,
            'password' => Hash::make($request->password), //es para guardar la contraseña de forma segura
        ]);

        if (!$Usuarios) {
            $data = [
                'isSuccess' => false,
                'message' => 'Error al crear el usuario',
                'status' => 500 //500 es internal server error - error inesperado en el servidor
            ];
            return response()->json($data, 500);
        }
         $data = [
            'isSuccess' => true,
            'usuario' => $Usuarios,
            'status' => 201
        ];
        return response()->json($data, 201); // 201 es created - se creo un nuevo recurso (usuario)   
    }

    public function login(Request $request)
    {
        //estos son los datos obligatorios requeridos que seran verificados para ingresar
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
            if (!$token = JWTAuth::attempt($credenciales)) { //es para verificar o autenticar las credenciales de los datos requeridos
                return response()->json(['error' => 'Credenciales invalidas'], 401); //401 es usuario no esta autenticado, token invalido
            }
            return response()->json(['token' => $token], 200); //si las credenciales son validas genera un token

        } catch (JWTException $e) {
                return response()->json(['error' => 'No se pudo generar el token', $e], 500);
        }
    }

    public function getUser()
    {
        $usuario = Auth::user(); //para obtener el usuario actual segun el token, es decir, validar ese token generado
        return response()->json($usuario, 200);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken()); //invalida el token actual luego de cerrar seccion, es decir, el que se genero al entrar
        return response()->json(['message' => 'Sección cerrada, exitosamente'], 200);
    }
}