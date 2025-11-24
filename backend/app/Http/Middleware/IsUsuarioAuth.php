<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsUsuarioAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth('api')->user()) { //si el usuario esta autenticado en el api las peticiones seran aceptadas
            return $next($request);
        }else{
            return response()->json(['message' => 'No autorizado'], 401); //si el usuario no esta autenticado en el api salga no autorizado
        }
    }
}
