<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
Use App\Models\Rol;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    //ejecuta el metodo run traduciendolo en sql como insert into... cuando en la terminal se pone php artisan db:seed --class=
    public function run(): void 
    {
        //se va insertar esos dos valores en la table roles
        Rol::Create(['tipo'=>'Administrador']);
        Rol::Create(['tipo'=>'Usuario']);
    }
}
