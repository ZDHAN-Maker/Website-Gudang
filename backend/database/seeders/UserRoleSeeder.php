<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat role
        $roles = ['manager', 'keeper', 'customer'];

        // Buat permission
        $permissions = ['create role', 'edit role', 'delete role', 'view role'];

        // Simpan role ke database
        foreach ($roles as $roleName) {
            $role = Role::firstOrCreate(['name' => $roleName]);
        }

        // Simpan permission ke database
        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName]);
        }

        // Ambil role manager dan berikan semua permission
        $managerRole = Role::where('name', 'manager')->first();
        $managerRole->givePermissionTo($permissions);

        // Buat user untuk setiap role
        foreach ($roles as $roleName) {
            $user = User::factory()->create([
                'name' => ucfirst($roleName) . ' User',
                'email' => $roleName . '@example.com',
                'phone' => fake()->phoneNumber(),
                'photo' => fake()->imageUrl(200, 200, 'people', true, 'profile'),
                'password' => Hash::make('password123'),
            ]);

            // Assign role ke user
            $user->assignRole($roleName);
        }
    }
}
