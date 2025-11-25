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

    //define que campos no se deben mostrar en la serializacion, sirve para evitar que se muestren campos no deseados
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
    //define que campos se deben convertir, sirve para convertir los campos a los tipos de datos deseados
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the rol that owns the usuario.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }


    //define la relacion entre el usuario y las reservas
    public function reservas()
    {
        return $this->hasMany(Reserva::class, 'usuario_id');
    }

    //define si el usuario es administrador
    public function isAdmin(): bool
    {
        return $this->rol_id === 1;
    }

    //define el identificador que se almacenara en el reclamo del JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    //define los claims personalizados que se agregaran al JWT
    public function getJWTCustomClaims()
    {
        return [
            'rol_id' => $this->rol_id,
            'email' => $this->email,
        ];
    }
}