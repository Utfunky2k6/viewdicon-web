import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bankingApi } from '@/lib/api'
import type { WalletBalance } from '@/types'

export function useBalance() {
  return useQuery<WalletBalance>({
    queryKey: ['balance'],
    queryFn:  () => bankingApi.balance() as Promise<WalletBalance>,
    staleTime: 60_000,
  })
}

export function useTransferCowries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { toAfroId: string; amount: number; note?: string }) =>
      bankingApi.transfer(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['balance'] }),
  })
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['rates'],
    queryFn:  () => bankingApi.rates(),
    staleTime: 5 * 60_000,
  })
}
