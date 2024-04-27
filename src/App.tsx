import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  // @ts-ignore
  const { data: paginatedTransactions, moreAvailable: morePaginated, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [filterbyemployee, setfilterbyemployee] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  let j = paginatedTransactions

  const loadAllTransactions = useCallback(async () => {
    setfilterbyemployee(false)
    setIsLoading(true)
    await employeeUtils.fetchAll()
    setIsLoading(false)
    await paginatedTransactionsUtils.fetchAll()

  }, [employeeUtils, paginatedTransactionsUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setfilterbyemployee(true)
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null) {
      loadAllTransactions()
    }
  }, [employees, loadAllTransactions])


  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }

            if (newValue === EMPTY_EMPLOYEE) {
              await loadAllTransactions()
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }

          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null && !filterbyemployee && morePaginated &&(
            <button
              className="RampButton"
              disabled={isLoading}
              onClick={ loadAllTransactions
              }
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
