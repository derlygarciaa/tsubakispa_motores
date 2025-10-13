<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $table = 'reservas';

    protected $fillable = [
        'usuario_id',
        'fecha',
        'hora_inicio',
        'hora_final',
        'estado',
    ];

    public function Usuario()
    {
        //muchos a 1
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
