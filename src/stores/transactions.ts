import { SubscriptionState } from './subscription'
import { create } from './utils'

type State = {
  pendingTransactions: Set<string>
  subscriptionState: SubscriptionState
}

type Actions = {
  addPendingTransaction: (tx: string) => void
  removePendingTransaction: (tx: string) => void
  setSubscriptionState: (state: SubscriptionState) => void
}

const initialState: State = {
  pendingTransactions: new Set(),
  subscriptionState: 'dynamic',
}

export const useTransactions = create<State & Actions>()((set, get) => ({
  ...initialState,
  setSubscriptionState: (state) => {
    set({ subscriptionState: state })
  },
  addPendingTransaction: (tx) => {
    const pendingTransactions = get().pendingTransactions
    pendingTransactions.add(tx)
    set({ pendingTransactions: new Set(pendingTransactions) })
  },
  removePendingTransaction: (tx) => {
    const pendingTransactions = get().pendingTransactions
    pendingTransactions.delete(tx)
    set({ pendingTransactions: new Set(pendingTransactions) })
  },
}))
