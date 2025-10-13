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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rol_id');
            $table->foreign('rol_id')->references('id')->on('roles')->onDelete('cascade');
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->string('email', 150)->unique();
            $table->string('telefono', 10);
            $table->string('Contraseña'); //modificar esta nombre de la columna
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
