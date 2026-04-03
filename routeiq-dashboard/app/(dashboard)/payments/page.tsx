'use client'

import { useState } from 'react'
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface Transaction {
  id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  timestamp: Date
  status: 'confirmed' | 'pending' | 'failed'
  txHash?: string
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_001',
    type: 'credit',
    amount: 100.00,
    description: 'USDC deposit via wallet',
    timestamp: new Date('2026-04-01T14:23:00'),
    status: 'confirmed',
    txHash: '0x3f8a...9c21',
  },
  {
    id: 'tx_002',
    type: 'debit',
    amount: 23.45,
    description: 'API usage — Customer Support Bot',
    timestamp: new Date('2026-04-01T00:00:00'),
    status: 'confirmed',
  },
  {
    id: 'tx_003',
    type: 'debit',
    amount: 45.67,
    description: 'API usage — Code Review Agent',
    timestamp: new Date('2026-03-31T00:00:00'),
    status: 'confirmed',
  },
  {
    id: 'tx_004',
    type: 'credit',
    amount: 200.00,
    description: 'USDC deposit via wallet',
    timestamp: new Date('2026-03-28T09:15:00'),
    status: 'confirmed',
    txHash: '0x7b2d...4f88',
  },
  {
    id: 'tx_005',
    type: 'debit',
    amount: 87.12,
    description: 'API usage — Research Assistant',
    timestamp: new Date('2026-03-28T00:00:00'),
    status: 'confirmed',
  },
  {
    id: 'tx_006',
    type: 'debit',
    amount: 31.20,
    description: 'API usage — All agents',
    timestamp: new Date('2026-03-27T00:00:00'),
    status: 'confirmed',
  },
  {
    id: 'tx_007',
    type: 'credit',
    amount: 50.00,
    description: 'USDC deposit (pending)',
    timestamp: new Date('2026-04-02T10:00:00'),
    status: 'pending',
    txHash: '0x1a9f...8e34',
  },
]

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'text-routeiq-green',
  pending: 'text-routeiq-amber',
  failed: 'text-routeiq-red',
}

export default function PaymentsPage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [copied, setCopied] = useState(false)

  const usdcBalance = 112.56
  const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f62789'

  const handleCopyAddress = () => {
    void navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your USDC balance and transaction history</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* USDC Balance */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400 font-bold text-sm">$</span>
            </div>
            <div>
              <p className="text-slate-400 text-sm">USDC Balance</p>
              <p className="text-white font-bold text-2xl">{usdcBalance.toFixed(2)}</p>
            </div>
          </div>
          {walletConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                <span className="text-slate-400 font-mono text-xs truncate flex-1">
                  {walletAddress}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-routeiq-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button className="w-full bg-routeiq-green/20 hover:bg-routeiq-green/30 text-routeiq-green border border-routeiq-green/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Deposit USDC
              </button>
            </div>
          ) : (
            <button
              onClick={() => setWalletConnected(true)}
              className="w-full flex items-center justify-center gap-2 bg-routeiq-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>

        {/* This month summary */}
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-4">This Month Summary</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Total API Usage</span>
              <span className="text-white font-medium">{formatCurrency(187.44)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Deposits</span>
              <span className="text-routeiq-green font-medium">+{formatCurrency(300.00)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/10 pt-3">
              <span className="text-slate-400 text-sm">Net Balance Change</span>
              <span className="text-routeiq-green font-medium">+{formatCurrency(112.56)}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-800 rounded-lg">
            <p className="text-slate-400 text-xs">
              RouteIQ uses USDC on Base for instant, low-fee settlement.
              Funds are used to pay AI providers as you make requests.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-slate-400 font-medium px-6 py-3">Type</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Description</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Date</th>
                <th className="text-right text-slate-400 font-medium px-4 py-3">Amount</th>
                <th className="text-right text-slate-400 font-medium px-4 py-3">Status</th>
                <th className="text-right text-slate-400 font-medium px-6 py-3">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    {tx.type === 'credit' ? (
                      <span className="flex items-center gap-1.5 text-routeiq-green">
                        <ArrowDownLeft className="w-4 h-4" />
                        Credit
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <ArrowUpRight className="w-4 h-4 text-routeiq-red" />
                        Debit
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-300">{tx.description}</td>
                  <td className="px-4 py-4 text-slate-400 text-xs">
                    {tx.timestamp.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono font-medium ${tx.type === 'credit' ? 'text-routeiq-green' : 'text-white'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className={`px-4 py-4 text-right text-xs capitalize ${STATUS_STYLES[tx.status]}`}>
                    {tx.status}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs text-slate-500">
                    {tx.txHash ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
