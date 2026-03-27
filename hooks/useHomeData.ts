import { useQueries } from '@tanstack/react-query';

export function useHomeData() {
  const results = useQueries({
    queries: [
      {
        queryKey: ['home', 'vitality'],
        queryFn: () => fetch('/api/v1/home/vitality').then(res => res.json()),
        staleTime: 2 * 60 * 1000,
      },
      {
        queryKey: ['griot', 'daily-briefing'],
        queryFn: () => fetch('/api/v1/griot/daily-briefing').then(res => res.json()),
        staleTime: 30 * 60 * 1000,
      },
      {
        queryKey: ['feed', 'nation-fires'],
        queryFn: () => fetch('/api/v1/feed/nation/top?limit=6').then(res => res.json()),
        staleTime: 1 * 60 * 1000,
      },
      {
        queryKey: ['work-ledger', 'recent'],
        queryFn: () => fetch('/api/v1/work-ledger/recent?limit=8').then(res => res.json()),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['ajo', 'my-circle'],
        queryFn: () => fetch('/api/v1/ajo/my-circle').then(res => res.json()),
        staleTime: 10 * 60 * 1000,
      }
    ]
  });

  const isLoading = results.some(r => r.isLoading);
  const isError = results.some(r => r.isError);

  return {
    vitality: results[0].data,
    griot: results[1].data,
    nationFires: results[2].data,
    workLedger: results[3].data,
    ajoCircle: results[4].data,
    isLoading,
    isError
  };
}
