<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RoleSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserRoleSeeder::class,
            RoleSeeder::class,
        ]);

        $managerRole = Role::where('name', 'Manager')->first();
        $keeperRole = Role::where('name', 'Keeper')->first();
        $customerRole = Role::where('name', 'Customer')->first();

        // Cek dan buat user Manager
        if (!User::where('email', 'manager@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Manager',
                'email' => 'manager@example.com',
                'password' => Hash::make('password123'),
                'role_id' => $managerRole->id,
            ]);
        }

        // Cek dan buat user Keeper
        if (!User::where('email', 'keeper@example.com')->exists()) {
            User::factory()->create([
                'name' => 'Keeper Contoh',
                'email' => 'keeper@example.com',
                'password' => Hash::make('password123'),
                'role_id' => $keeperRole->id,
            ]);
        }

        // Cek dan buat user Customer berdasarkan NISN
        if (!User::where('nisn', '1234567890')->exists()) {
            User::factory()->create([
                'name' => 'Customer Contoh',
                'nisn' => '1234567890',
                'email' => null,
                'password' => Hash::make('password123'),
                'role_id' => $customerRole->id,
            ]);
        }
    }
}
