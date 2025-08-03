<?php


use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create(['name' => 'keeper']);
        Role::create(['name' => 'manager']);
        Role::create(['name' => 'customer']);
    }
}