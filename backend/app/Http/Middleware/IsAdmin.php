<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = auth('api')->user();
        //debe ser un usuario autenticado y con un rol de admin para acceder, admitiendo peticiones
        if ($usuario && $usuario->rol_id === 1) {
            return $next($request);
        }else{
            return response()->json(['message' => 'No eres un admin'], 403);
            //403 es usuario autenticado pero no tiene permisos para acceder
        }
    }
}
