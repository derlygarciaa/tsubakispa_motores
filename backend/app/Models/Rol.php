<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';
    
    protected $fillable = ['tipo'];

    public function Usuario()
    {
        //1 a muchos
        return $this->hasMany(Usuario::class,'rol_id');
    }
}
