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
        Schema::table('reservas', function (Blueprint $table) {
            $table->unsignedBigInteger('servicio_id')->nullable()->after('usuario_id');
            $table->string('telefono_contacto', 15)->nullable()->after('servicio_id');
            $table->integer('numero_personas')->default(1)->after('telefono_contacto');
            $table->text('observaciones')->nullable()->after('numero_personas');
            $table->decimal('precio', 10, 2)->nullable()->after('observaciones');
            
            // Índices para optimizar consultas
            $table->index('servicio_id');
            $table->index(['fecha', 'hora_inicio']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropIndex(['servicio_id']);
            $table->dropIndex(['fecha', 'hora_inicio']);
            
            $table->dropColumn([
                'servicio_id',
                'telefono_contacto',
                'numero_personas',
                'observaciones',
                'precio'
            ]);
        });
    }
};

