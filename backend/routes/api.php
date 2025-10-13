<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ReservaController;
use App\Http\Middleware\IsUsuarioAuth;
use App\Http\Middleware\IsAdmin;

//rutas publicas
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

//rutas privadas
Route::middleware([IsUsuarioAuth::class])->group(function(){
  Route::controller(AuthController::class)->group(function(){
    Route::post('logout', 'logout');
    Route::get('me', 'getUser');
  });

  Route::get('/reservas', [ReservaController::class, 'index']); //mostrar toda la lista de reservas
});

//rutas privadas
Route::middleware([IsAdmin::class])->group(function(){
  Route::controller(ReservaController::class)->group(function(){
    Route::get('/reservas/{id}', 'show'); //mostrar una reserva en especifico
    Route::post('/reservas', 'store'); //agregar una reserva
    Route::put('/reservas/{id}', 'update'); //actualizar una reserva
    Route::patch('/reservas/{id}', 'updatePartial'); //actualiza una reserva pero por datos aparte
    Route::delete('/reservas/{id}', 'destroy'); //eliminar una reserva
    });
});

/*
//mostrar toda la lista de usuarios
Route::get('/usuarios', [UsuarioController::class, 'index']);

//mostrar un usuario en especifico
Route::get('/usuarios/{id}', [UsuarioController::class, 'show']);

//agregar un usuario
Route::post('/usuarios', [UsuarioController::class, 'store']);

//actualiza un usuario
Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);

//actualiza un usuario pero por datos aparte, es decir solo nombre o apellido, etc
Route::patch('/usuarios/{id}', [UsuarioController::class, 'updatePartial']);

//elimina un usuario
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);


//mostrar toda la lista de reservas
Route::get('/reservas', [ReservaController::class, 'index']);

//mostrar una reserva en especifico
Route::get('/reservas/{id}', [ReservaController::class, 'show']);

//agregar una reserva
Route::post('/reservas', [ReservaController::class, 'store']);

//actualiza una reserva
Route::put('/reservas/{id}', [ReservaController::class, 'update']);

//actualiza una reserva pero por datos aparte
Route::patch('/reservas/{id}', [ReservaController::class, 'updatePartial']);

//elimina una reserva
Route::delete('/reservas/{id}', [ReservaController::class, 'destroy']);
*/