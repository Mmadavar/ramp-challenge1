import { Employee } from "./types"
import {usePaginatedTransactions} from "../hooks/usePaginatedTransactions";


export const EMPTY_EMPLOYEE: Employee = {
  id: "",
  firstName: "All",
  lastName: "Employees",
}
