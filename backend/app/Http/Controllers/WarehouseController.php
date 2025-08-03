<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseRequest;
use App\Http\Resources\WarehouseResource;
use App\Services\WarehouseService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
     private WarehouseService $warehouseService;

    public function __construct(WarehouseService $warehouseService)
    {
        $this->warehouseService = $warehouseService;
    }

    public function index()
    {
        $fields = ['id','name','photo','tagline'];
        $warehouses = $this->warehouseService->getAll($fields);
        return response()->json(WarehouseResource::collection($warehouses)); 
    }

    public function show(int $id)
    {
        try{
            $fields = ['id','name','photo','tagline'];
            $warehouses = $this->warehouseService->getById($id,$fields);
            return response()->json(new WarehouseResource($warehouses));
        } catch(ModelNotFoundException $e){
            return response()->json([
                'message'=>'warehouse not found',
            ], 404);
        }
    }

    public function store(WarehouseRequest $request)
    {
        $warehouses = $this->warehouseService->create($request->validated());
        return response()->json(new WarehouseResource($warehouses),201);
    }

    public function update(WarehouseRequest $request, int $id)
    {
        try{
            $warehouses =  $this->warehouseService->update($id, $request->validated());
            return response()->json(new WarehouseResource ($warehouses));
        }catch(ModelNotFoundException){
            return response()->json([
                'message' => 'warehouse not found',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try{
            $this->warehouseService->delete($id);
            return response()->json([
                'message'=> 'warehouse deleted succesfully'
            ]);
        }catch(ModelNotFoundException){
            return response()->json([
                'message' => 'warehouse not found',
            ],404);
        }
    }
}
