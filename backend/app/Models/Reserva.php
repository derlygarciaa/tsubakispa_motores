<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Reserva extends Model
{
    use HasFactory;

    protected $table = 'reservas';

    //define que campos se pueden usar o asignar, sirve para evitar que se usen campos no deseados
    protected $fillable = [
        'usuario_id',
        'servicio_id',
        'fecha',
        'hora_inicio',
        'hora_final',
        'estado',
        'telefono_contacto',
        'numero_personas',
        'observaciones',
        'precio',
    ];

    //define que campos se deben convertir, sirve para convertir los campos a los tipos de datos deseados
    protected $casts = [
        'fecha' => 'date:Y-m-d',
        'precio' => 'decimal:2',
        'numero_personas' => 'integer',
    ];

    //accessors para formatear las horas correctamente
    protected function getHoraInicioAttribute($value)
    {
        if (!$value) return null;
        // Extraer solo HH:mm del valor TIME
        return substr($value, 0, 5); 
    }

    protected function getHoraFinalAttribute($value)
    {
        if (!$value) return null;
        // Extraer solo HH:mm del valor TIME
        return substr($value, 0, 5); 
    }

    //define los estados permitidos para una reserva
    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_CONFIRMADA = 'confirmada';
    const ESTADO_CANCELADA = 'cancelada';

    //define la relacion entre la reserva y el usuario
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    //define la relacion entre la reserva y el servicio
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    //define si la reserva esta confirmada
    public function isConfirmada(): bool
    {
        return $this->estado === self::ESTADO_CONFIRMADA;
    }

    //define si la reserva esta cancelada
    public function isCancelada(): bool
    {
        return $this->estado === self::ESTADO_CANCELADA;
    }

    //define si la reserva esta en el pasado
    public function isPast(): bool
    {
        return Carbon::parse($this->fecha)->isPast();
    }
}
