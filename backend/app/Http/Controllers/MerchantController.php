<?php

namespace App\Http\Controllers;

use App\Http\Requests\MerchantRequest;
use App\Http\Resources\MerchantResource;
use App\Services\MerchantService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MerchantController extends Controller
{
    private MerchantService $merchantService;

    public function __construct(MerchantService $merchantService)
    {
        $this->merchantService = $merchantService;
    }

    public function index()
    {
        // Kolom 'dn' dan 'tagline' dihapus karena tidak ada di migrasi merchants
        $fields = ['id', 'name', 'address', 'photo', 'phone']; 
        $merchants = $this->merchantService->getAll($fields);
        return response()->json(MerchantResource::collection($merchants));
    }

    public function show(int $id)
    {
        try {
            // Kolom 'tagline' dihapus
            $fields = ['id', 'name', 'photo', 'address', 'phone'];
            $merchant = $this->merchantService->getById($id, $fields);
            return response()->json(new MerchantResource($merchant));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'merchant not found',
            ], 404);
        }
    }

    public function store(MerchantRequest $request)
    {
        $merchant = $this->merchantService->create($request->validated());
        return response()->json(new MerchantResource($merchant), 201);
    }

    public function update(MerchantRequest $request, int $id)
    {
        try {
            $merchant = $this->merchantService->update($id, $request->validated());
            return response()->json(new MerchantResource($merchant));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'merchant not found',
            ], 404);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->merchantService->delete($id);
            return response()->json([
                'message' => 'merchant deleted successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'merchant not found',
            ], 404);
        }
    }

    public function getMyMerchantProfile()
    {
        $userId = Auth::id();

        try {
            $merchant = $this->merchantService->getByKeeperId($userId);
            return response()->json(new MerchantResource($merchant));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'merchant not found for this user',
            ], 404);
        }
    }
}