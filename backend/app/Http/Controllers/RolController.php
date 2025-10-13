<?php

namespace App\Http\Controllers;

use App\Models\Rol;
use Exception;
use Illuminate\Http\Request;

class RolController extends Controller
{
    public function index()
    {
        try {
            //code...
        } catch (\Throwable $th) {
            //throw $th;
        }
        return Rol::all();
    }

    public function store(Request $request) 
    {
        return Rol::create($request->only('tipo'));
    }
}