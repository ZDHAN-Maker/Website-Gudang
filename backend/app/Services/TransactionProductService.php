<?php

namespace App\Services;

use App\Repositories\TransactionProductRepository;

class TransactionProductService
{
    private TransactionProductRepository $transactionProductRepository;

    public function __construct(TransactionProductRepository $transactionProductRepository)
    {
        $this->transactionProductRepository = $transactionProductRepository;
    }

    public function getItemsByTransaction(int $transactionId)
    {
        return $this->transactionProductRepository->getByTransactionId($transactionId);
    }
}