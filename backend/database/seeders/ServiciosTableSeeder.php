<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiciosTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $servicios = [
            // Masajes
            [
                'nombre' => 'Masaje Relajante',
                'descripcion' => 'Masaje de cuerpo completo con técnicas de relajación profunda',
                'duracion_minutos' => 60,
                'precio' => 150000,
                'categoria' => 'masajes',
                'activo' => true,
            ],
            [
                'nombre' => 'Masaje Descontracturante',
                'descripcion' => 'Masaje terapéutico para aliviar tensiones musculares',
                'duracion_minutos' => 60,
                'precio' => 170000,
                'categoria' => 'masajes',
                'activo' => true,
            ],
            [
                'nombre' => 'Masaje con Piedras Calientes',
                'descripcion' => 'Masaje con piedras volcánicas para relajación profunda',
                'duracion_minutos' => 90,
                'precio' => 200000,
                'categoria' => 'masajes',
                'activo' => true,
            ],
            [
                'nombre' => 'Masaje Sueco',
                'descripcion' => 'Técnica clásica de masaje para circulación y bienestar',
                'duracion_minutos' => 60,
                'precio' => 160000,
                'categoria' => 'masajes',
                'activo' => true,
            ],
            
            // Faciales
            [
                'nombre' => 'Limpieza Facial Profunda',
                'descripcion' => 'Limpieza, exfoliación e hidratación facial completa',
                'duracion_minutos' => 60,
                'precio' => 120000,
                'categoria' => 'faciales',
                'activo' => true,
            ],
            [
                'nombre' => 'Facial Antienvejecimiento',
                'descripcion' => 'Tratamiento con ácido hialurónico y vitamina C',
                'duracion_minutos' => 90,
                'precio' => 180000,
                'categoria' => 'faciales',
                'activo' => true,
            ],
            [
                'nombre' => 'Facial Hidratante',
                'descripcion' => 'Hidratación profunda para piel seca',
                'duracion_minutos' => 60,
                'precio' => 130000,
                'categoria' => 'faciales',
                'activo' => true,
            ],
            
            // Corporales
            [
                'nombre' => 'Exfoliación Corporal',
                'descripcion' => 'Exfoliación completa con sales minerales',
                'duracion_minutos' => 45,
                'precio' => 100000,
                'categoria' => 'corporales',
                'activo' => true,
            ],
            [
                'nombre' => 'Envoltura de Algas',
                'descripcion' => 'Tratamiento desintoxicante y reafirmante',
                'duracion_minutos' => 60,
                'precio' => 150000,
                'categoria' => 'corporales',
                'activo' => true,
            ],
            
            // Manicure y Pedicure
            [
                'nombre' => 'Manicure Spa',
                'descripcion' => 'Manicure completo con exfoliación e hidratación',
                'duracion_minutos' => 45,
                'precio' => 50000,
                'categoria' => 'manicure',
                'activo' => true,
            ],
            [
                'nombre' => 'Pedicure Spa',
                'descripcion' => 'Pedicure completo con masaje y tratamiento',
                'duracion_minutos' => 60,
                'precio' => 60000,
                'categoria' => 'pedicure',
                'activo' => true,
            ],
            [
                'nombre' => 'Manicure y Pedicure Combo',
                'descripcion' => 'Servicio completo de manos y pies',
                'duracion_minutos' => 90,
                'precio' => 95000,
                'categoria' => 'manicure',
                'activo' => true,
            ],
            
            // Depilación
            [
                'nombre' => 'Depilación con Cera - Piernas Completas',
                'descripcion' => 'Depilación con cera de piernas completas',
                'duracion_minutos' => 45,
                'precio' => 70000,
                'categoria' => 'depilacion',
                'activo' => true,
            ],
            [
                'nombre' => 'Depilación Facial',
                'descripcion' => 'Depilación con cera de rostro completo',
                'duracion_minutos' => 30,
                'precio' => 35000,
                'categoria' => 'depilacion',
                'activo' => true,
            ],
        ];

        foreach ($servicios as $servicio) {
            DB::table('servicios')->insert($servicio);
        }
    }
}

