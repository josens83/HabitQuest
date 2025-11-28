'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ItemCard } from '@/components/game/item-card'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states'
import { Badge } from '@/components/ui/badge'

type ItemType = 'CONSUMABLE' | 'COSMETIC' | 'BOOST' | 'SPECIAL'
type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

interface InventoryItem {
  id: string
  itemId: string
  quantity: number
  isEquipped: boolean
  item: {
    id: string
    name: string
    description: string
    icon: string
    rarity: ItemRarity
    type: ItemType
    category: string
  }
}

interface InventoryResponse {
  items: InventoryItem[]
  stats: {
    totalItems: number
    totalSlots: number
    usedSlots: number
  }
}

async function fetchInventory(): Promise<InventoryResponse> {
  const response = await fetch('/api/inventory')
  if (!response.ok) {
    throw new Error('Failed to fetch inventory')
  }
  return response.json()
}

async function useItem(itemId: string) {
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to use item')
  }
  return response.json()
}

async function equipItem(itemId: string) {
  const response = await fetch('/api/inventory/equip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to equip item')
  }
  return response.json()
}

export default function InventoryPage() {
  const [filterType, setFilterType] = useState<'all' | ItemType>('all')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventory,
  })

  const useMutation = useMutation({
    mutationFn: useItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['character'] })
      alert(`아이템을 사용했습니다!\n${data.effects.map((e: any) => e.message).join('\n')}`)
    },
    onError: (error: Error) => {
      alert(`오류: ${error.message}`)
    },
  })

  const equipMutation = useMutation({
    mutationFn: equipItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      alert('아이템을 장착했습니다!')
    },
    onError: (error: Error) => {
      alert(`오류: ${error.message}`)
    },
  })

  const handleUse = (itemId: string) => {
    if (confirm('이 아이템을 사용하시겠습니까?')) {
      useMutation.mutate(itemId)
    }
  }

  const handleEquip = (itemId: string) => {
    equipMutation.mutate(itemId)
  }

  const filterTypes: Array<{ key: 'all' | ItemType; label: string }> = [
    { key: 'all', label: '전체' },
    { key: 'CONSUMABLE', label: '소모품' },
    { key: 'COSMETIC', label: '코스메틱' },
    { key: 'BOOST', label: '부스트' },
    { key: 'SPECIAL', label: '특별' },
  ]

  const filteredItems =
    filterType === 'all'
      ? data?.items
      : data?.items.filter((item) => item.item.type === filterType)

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">인벤토리</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              보유 중인 아이템을 관리하세요
            </p>
          </div>
          {data?.stats && (
            <Badge variant="info" size="lg">
              {data.stats.usedSlots} / {data.stats.totalSlots} 슬롯
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {filterTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setFilterType(type.key)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
              ${
                filterType === type.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      {isLoading && <LoadingState message="인벤토리를 불러오는 중..." />}

      {error && (
        <ErrorState
          message="인벤토리를 불러오는데 실패했습니다."
          action={{
            label: '다시 시도',
            onClick: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
          }}
        />
      )}

      {filteredItems && filteredItems.length === 0 && (
        <EmptyState
          icon="📦"
          title="아이템이 없습니다"
          description={
            filterType === 'all'
              ? '아직 보유한 아이템이 없습니다. 상점에서 아이템을 구매해보세요!'
              : '이 카테고리에 아이템이 없습니다.'
          }
          action={{
            label: '상점 가기',
            href: '/shop',
          }}
        />
      )}

      {filteredItems && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((inventoryItem) => (
            <ItemCard
              key={inventoryItem.id}
              item={{
                id: inventoryItem.itemId,
                name: inventoryItem.item.name,
                description: inventoryItem.item.description,
                icon: inventoryItem.item.icon,
                rarity: inventoryItem.item.rarity,
                type: inventoryItem.item.type,
                quantity: inventoryItem.quantity,
              }}
              mode="inventory"
              onUse={handleUse}
              onEquip={handleEquip}
              isEquipped={inventoryItem.isEquipped}
            />
          ))}
        </div>
      )}
    </div>
  )
}
