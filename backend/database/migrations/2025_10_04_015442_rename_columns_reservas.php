<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //modifique el nombre de la columna de la tabla usuarios
        Schema::table('reservas', function (Blueprint $table) {
            $table->renameColumn('hora inicio', 'hora_inicio');
            $table->renameColumn('hora final', 'hora_final');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
