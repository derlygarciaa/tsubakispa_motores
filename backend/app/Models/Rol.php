<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Rol extends Model
{
    use HasFactory;

    protected $table = 'roles';

    //define que campos se pueden usar o asignar, sirve para evitar que se usen campos no deseados
    protected $fillable = ['tipo'];

    //define las constantes para los roles
    const ADMIN = 1;
    const USUARIO = 2;

    //define la relacion entre el rol y los usuarios
    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'rol_id');
    }
}
