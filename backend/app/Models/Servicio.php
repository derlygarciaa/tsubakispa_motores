<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicios';

    protected $fillable = [
        'nombre',
        'descripcion',
        'duracion_minutos',
        'precio',
        'categoria',
        'activo',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'duracion_minutos' => 'integer',
        'activo' => 'boolean',
    ];

    // Categorías disponibles
    const CATEGORIA_MASAJES = 'masajes';
    const CATEGORIA_FACIALES = 'faciales';
    const CATEGORIA_CORPORALES = 'corporales';
    const CATEGORIA_MANICURE = 'manicure';
    const CATEGORIA_PEDICURE = 'pedicure';
    const CATEGORIA_DEPILACION = 'depilacion';
    const CATEGORIA_OTROS = 'otros';

    //define la relacion entre el servicio y las reservas
    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    //define el scope para obtener solo servicios activos
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    //define el scope para filtrar por categoria
    public function scopeCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    //define el metodo para obtener el precio formateado
    public function getPrecioFormateadoAttribute(): string
    {
        return '$' . number_format($this->precio, 0, ',', '.');
    }

    //define el metodo para obtener la duracion formateada
    public function getDuracionFormateadaAttribute(): string
    {
        $horas = floor($this->duracion_minutos / 60);
        $minutos = $this->duracion_minutos % 60;

        if ($horas > 0 && $minutos > 0) {
            return "{$horas}h {$minutos}min";
        } elseif ($horas > 0) {
            return "{$horas}h";
        } else {
            return "{$minutos}min";
        }
    }
}

