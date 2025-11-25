<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ServicioController;
use App\Http\Middleware\IsUsuarioAuth;
use App\Http\Middleware\IsAdmin;



//rutas para el login y registro publicas
Route::post('login', [AuthController::class, 'login'])->name('api.login');
Route::post('register', [AuthController::class, 'register'])->name('api.register');

//rutas para las rutas autenticadas
Route::middleware(['auth.usuario'])->group(function () {
    
    // Auth Routes
    Route::prefix('auth')->name('api.auth.')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('me', [AuthController::class, 'getUser'])->name('me');
        Route::post('refresh', [AuthController::class, 'refresh'])->name('refresh');
    });

    //rutas para las reservas (todos los usuarios autenticados)
    Route::prefix('reservas')->name('api.reservas.')->group(function () {
        Route::get('/mis-reservas', [ReservaController::class, 'misReservas'])->name('mis-reservas');
        Route::post('/', [ReservaController::class, 'store'])->name('store');
    });

    //rutas para servicios (todos los usuarios autenticados pueden ver servicios)
    Route::prefix('servicios')->name('api.servicios.')->group(function () {
        Route::get('/', [ServicioController::class, 'index'])->name('index');
        Route::get('/categoria/{categoria}', [ServicioController::class, 'porCategoria'])->name('categoria');
        Route::get('/{id}', [ServicioController::class, 'show'])->name('show');
    });
});

//rutas para las reservas solo para administradores
Route::middleware(['admin'])->group(function () {
    
    //rutas para las reservas solo para administradores
    Route::prefix('reservas')->name('api.reservas.')->group(function () {
        Route::get('/', [ReservaController::class, 'index'])->name('index');
        Route::get('/{id}', [ReservaController::class, 'show'])->name('show');
        Route::put('/{id}', [ReservaController::class, 'update'])->name('update');
        Route::patch('/{id}', [ReservaController::class, 'updatePartial'])->name('updatePartial');
        Route::delete('/{id}', [ReservaController::class, 'destroy'])->name('destroy');
    });

    //rutas para las usuarios solo para administradores
    Route::prefix('usuarios')->name('api.usuarios.')->group(function () {
        Route::get('/', [UsuarioController::class, 'index'])->name('index');
        Route::get('/{id}', [UsuarioController::class, 'show'])->name('show');
        Route::post('/', [UsuarioController::class, 'store'])->name('store');
        Route::put('/{id}', [UsuarioController::class, 'update'])->name('update');
        Route::patch('/{id}', [UsuarioController::class, 'updatePartial'])->name('updatePartial');
        Route::delete('/{id}', [UsuarioController::class, 'destroy'])->name('destroy');
    });
});