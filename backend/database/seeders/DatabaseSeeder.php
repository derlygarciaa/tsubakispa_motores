<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

//seeder para inicializar la base de datos
class DatabaseSeeder extends Seeder
{
    //funcion para inicializar la base de datos
    public function run(): void
    {
        //ejecutar seeders en orden
        $this->call([
            RolesTableSeeder::class,
            UsuariosTableSeeder::class,
            ServiciosTableSeeder::class,
        ]);

        $this->command->info('Base de datos inicializada correctamente!');
        $this->command->info('Usuarios creados:');
        $this->command->info('Admin: admin@tsubakispa.com / admin123');
        $this->command->info('Usuario: usuario@tsubakispa.com / usuario123');
    }
}
