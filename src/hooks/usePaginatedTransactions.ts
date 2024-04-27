import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): { moreAvailable: boolean; data: PaginatedResponse<Transaction[]> | null; fetchAll: () => Promise<void>; invalidateData: () => void; loading: boolean } {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)
  const [moreAvailable, setMoreAvailable] = useState(true)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        return previousResponse
      }

      if (previousResponse === null) {
        return response;
      }

      const moredata = response.nextPage !== undefined && response.nextPage !== null;
      setMoreAvailable(moredata)
      return { data: [...previousResponse.data, ...response.data] , nextPage: response.nextPage }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
    setMoreAvailable(true)
  }, [])

  return { data: paginatedTransactions, moreAvailable, loading, fetchAll, invalidateData }
}
