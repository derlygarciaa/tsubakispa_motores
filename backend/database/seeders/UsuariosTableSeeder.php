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
        //Insertar un registro como administrador
        Usuario::create([
            'rol_id' => 1, //1 porque fue como se definio en el seeder de roles
            'nombres' => 'Derly Dayana',
            'apellidos' => 'Garcia Carrillo',
            'telefono' => '3224683285',
            'email' => 'derly.gar24@gmail.com',
            'contraseña' => Hash::make('contraseña'),
        ]);
    }
}
