<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Exception;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function getOverview(): JsonResponse
    {
        try {
            $data = $this->dashboardService->getOverviewData();
            
            return response()->json($data, 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat data dashboard.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}