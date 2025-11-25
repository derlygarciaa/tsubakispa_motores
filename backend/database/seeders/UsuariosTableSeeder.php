<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash; //sirve para encriptar la contraseña

class UsuariosTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insertar usuario administrador
        Usuario::create([
            'rol_id' => 1, // Admin
            'nombres' => 'Admin',
            'apellidos' => 'Tsubaki Spa',
            'telefono' => '3001234567',
            'email' => 'admin@tsubakispa.com',
            'password' => Hash::make('admin123'),
        ]);

        // Insertar usuario normal de prueba
        Usuario::create([
            'rol_id' => 2, // Usuario normal
            'nombres' => 'Usuario',
            'apellidos' => 'Demo',
            'telefono' => '3009876543',
            'email' => 'usuario@tsubakispa.com',
            'password' => Hash::make('usuario123'),
        ]);
    }
}
