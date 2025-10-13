<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Usuario extends Authenticatable implements JWTSubject
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'usuarios';

    protected $dates = ['deleted_at'];

    //define que campos se pueden usar o asignar, sirve para evitar que se usen campos no deseados
    protected $fillable = [
        'rol_id',
        'nombres',
        'apellidos',
        'email',
        'telefono',
        'password',
    ];

    //cada usuario tiene un rol, con rol_id busca el rol que corresponde
    public function Rol()
    {
        //muchos a 1
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    //un usuario puede tener muchas reservas, se busca todas la reservas donde usuario_id coincida con el id
    public function Reserva()
    {
        //1 a muchos
        return $this->hasMany(Reserva::class, 'usuario_id');
    }   

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}